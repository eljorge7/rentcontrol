import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service'; // Assuming PrismaService is in ../prisma/prisma.service
import { MercadopagoService } from '../mercadopago/mercadopago.service';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private syscomToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private productsCache: Map<string, { data: any, expiresAt: number }> = new Map();

  constructor(
    private prisma: PrismaService,
    private mercadopagoService: MercadopagoService
  ) {}

  private async getSyscomToken(): Promise<string> {
    const now = Date.now();
    if (this.syscomToken && this.tokenExpiresAt > now) {
      return this.syscomToken as string;
    }

    this.logger.log('Solicitando nuevo token a Syscom...');
    try {
      const response = await axios.post('https://developers.syscom.mx/oauth/token', new URLSearchParams({
        client_id: process.env.SYSCOM_CLIENT_ID || 'hK0bhtA1J4s3f6E70ncYdN30pR6c2nOD',
        client_secret: process.env.SYSCOM_CLIENT_SECRET || 'ARa4IaLNqU2XD1K5YDBsZCPCXQHgGYSQjrj8qExq',
        grant_type: 'client_credentials'
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.syscomToken = response.data.access_token;
      // Expires in seconds (usually 31536000), we subtract 5 min for safety
      this.tokenExpiresAt = now + ((response.data.expires_in - 300) * 1000); 
      this.logger.log('Token de Syscom obtenido exitosamente.');
      return this.syscomToken as string;
    } catch (error) {
      this.logger.error('Error al obtener token de Syscom:', error?.response?.data || error.message);
      throw new Error('No se pudo autenticar con Syscom');
    }
  }

  async getSyscomProducts(search: string = '', page: number = 1) {
    const cacheKey = `syscom_products_${search}_${page}`;
    const now = Date.now();

    // Caché de 15 minutos para búsquedas para evitar agotar 60 req/min
    if (this.productsCache.has(cacheKey)) {
      const cached = this.productsCache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }
    }

    const token = await this.getSyscomToken();

    try {
      // Obtenemos tipo de cambio
      let exchangeRate = 18.0; // Default
      try {
        const tcRes = await axios.get('https://developers.syscom.mx/api/v1/tipocambio', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (tcRes.data && tcRes.data.normal) {
          exchangeRate = parseFloat(tcRes.data.normal);
        }
      } catch (e) {
        this.logger.warn('No se pudo obtener el tipo de cambio de Syscom, usando 18.0 por defecto.');
      }

      const params: any = { pagina: page };
      if (search && search.trim() !== '') {
        params.busqueda = search;
      } else {
        // Syscom requires a search term if no category is provided. We provide a default to show popular products.
        params.busqueda = 'kit'; 
      }

      const response = await axios.get('https://developers.syscom.mx/api/v1/productos', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const rawProducts = response.data.productos || [];
      
      // Aplicar Markup del 25% al precio de lista para ser altamente competitivo
      const MARKUP_PERCENTAGE = 0.25;
      
      const mappedProducts = rawProducts.map((p: any) => {
        // Parsear el precio usando "precio_descuento" (el costo real para el dealer, SIN IVA)
        const basePriceUsd = parseFloat(p.precios?.precio_descuento || p.precios?.precio_lista || p.precio_lista || 0);
        // Agregamos 30% de margen, y luego agregamos 16% de IVA ya que el frontend asume que el precio base incluye IVA
        const sellPriceUsd = basePriceUsd > 0 ? (basePriceUsd * (1 + MARKUP_PERCENTAGE)) * 1.16 : 0;
        const sellPriceMxn = sellPriceUsd * exchangeRate;
        
        return {
          id: `syscom_${p.producto_id}`,
          syscomId: String(p.producto_id),
          title: p.titulo,
          brand: p.marca,
          model: p.modelo,
          price: parseFloat(sellPriceMxn.toFixed(2)), // En MXN por defecto
          priceUsd: parseFloat(sellPriceUsd.toFixed(2)),
          exchangeRate: exchangeRate,
          stock: p.existencia?.nuevo || 0,
          imageUrl: p.img_portada || p.imagen,
          category: p.categorias?.[0]?.nombre || 'General',
          isActive: true,
          source: 'syscom'
        };
      });

      const result = {
        products: mappedProducts,
        paginas: response.data.paginas
      };

      this.productsCache.set(cacheKey, { data: result, expiresAt: now + (15 * 60 * 1000) }); // 15 mins cache
      return result;

    } catch (error) {
      this.logger.error('Error fetching syscom products', error?.response?.data || error.message);
      return { products: [], paginas: 0 };
    }
  }

  async getLocalProducts(search: string = '') {
    try {
      // Fetch from FacturaPro (Single Source of Truth)
      const res = await fetch('http://localhost:3005/products/store/published');
      if (!res.ok) throw new Error('Failed to fetch from FacturaPro');
      const fpProducts = await res.json();
      
      let localProducts = fpProducts.map((p: any) => ({
        id: p.id,
        title: p.name,
        brand: p.storeCategory || 'Destacado',
        model: 'FP-' + p.id.split('-')[0],
        description: p.description,
        price: p.price, // It already is base price, store calculates IVA if needed
        imageUrl: p.imageUrl ? `http://localhost:3005${p.imageUrl}` : '',
        category: p.storeCategory,
        stock: p.type === 'SERVICE' ? 999 : p.stock,
        source: 'local'
      }));

      if (search) {
         const lowerSearch = search.toLowerCase();
         localProducts = localProducts.filter((p: any) => 
            p.title.toLowerCase().includes(lowerSearch) || 
            p.brand.toLowerCase().includes(lowerSearch)
         );
      }

      return localProducts;
    } catch (error) {
      this.logger.error('Error fetching FacturaPro products', error);
      return [];
    }
  }

  async getCombinedCatalog(search: string = '', page: number = 1) {
    const [syscomData, localData] = await Promise.all([
      this.getSyscomProducts(search, page),
      page === 1 ? this.getLocalProducts(search) : Promise.resolve([]) // Only fetch local on page 1 for simplicity, or handle proper pagination later
    ]);

    // Mezclamos: Primero los locales, luego los de syscom
    return {
      products: [...localData, ...syscomData.products],
      paginas: syscomData.paginas
    };
  }

  async getProductDetails(id: string) {
    if (!id.startsWith('syscom_')) {
      // Es local
      const localProducts = await this.getLocalProducts();
      const product = localProducts.find((p: any) => p.id === id);
      if (!product) throw new Error('Product not found');
      
      // Simulamos alternativas
      const alternativas = localProducts.filter((p: any) => p.id !== id).slice(0, 5);
      
      return {
         ...product,
         caracteristicas: [],
         recursos: [],
         imagenesExtra: [],
         alternativas
      };
    }

    const syscomId = id.replace('syscom_', '');
    const token = await this.getSyscomToken();

    try {
      // Fetch Product Details
      const res = await axios.get(`https://developers.syscom.mx/api/v1/productos/${syscomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const p = res.data;

      let exchangeRate = 18.0;
      try {
        const tcRes = await axios.get('https://developers.syscom.mx/api/v1/tipocambio', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (tcRes.data && tcRes.data.normal) exchangeRate = parseFloat(tcRes.data.normal);
      } catch (e) {}

      const MARKUP_PERCENTAGE = 0.25;
      const basePriceUsd = parseFloat(p.precios?.precio_descuento || p.precios?.precio_lista || p.precio_lista || 0);
      const sellPriceUsd = basePriceUsd > 0 ? (basePriceUsd * (1 + MARKUP_PERCENTAGE)) * 1.16 : 0;
      const sellPriceMxn = sellPriceUsd * exchangeRate;

      const categoryId = p.categorias?.[0]?.id;
      let alternativas = [];

      // Fetch Alternatives (by category)
      if (categoryId) {
         try {
            const altRes = await axios.get(`https://developers.syscom.mx/api/v1/productos?categoria=${categoryId}`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            const altRaw = altRes.data.productos || [];
            
            alternativas = altRaw.slice(0, 6).map((ap: any) => {
               const aBasePriceUsd = parseFloat(ap.precios?.precio_descuento || ap.precios?.precio_lista || ap.precio_lista || 0);
               const aSellPriceUsd = aBasePriceUsd > 0 ? (aBasePriceUsd * (1 + MARKUP_PERCENTAGE)) * 1.16 : 0;
               const aSellPriceMxn = aSellPriceUsd * exchangeRate;
               return {
                 id: `syscom_${ap.producto_id}`,
                 syscomId: String(ap.producto_id),
                 title: ap.titulo,
                 brand: ap.marca,
                 model: ap.modelo,
                 price: parseFloat(aSellPriceMxn.toFixed(2)),
                 stock: ap.existencia?.nuevo || 0,
                 imageUrl: ap.img_portada || ap.imagen,
                 category: ap.categorias?.[0]?.nombre || 'General',
                 source: 'syscom'
               };
            }).filter((ap: any) => ap.syscomId !== syscomId); // exclude self
         } catch(e) {
            this.logger.warn('Error fetching alternatives');
         }
      }

      return {
        id: `syscom_${p.producto_id}`,
        syscomId: String(p.producto_id),
        title: p.titulo,
        brand: p.marca,
        model: p.modelo,
        description: p.descripcion,
        price: parseFloat(sellPriceMxn.toFixed(2)),
        stock: p.existencia?.nuevo || p.total_existencia || 0,
        imageUrl: p.img_portada || p.imagen,
        category: p.categorias?.[0]?.nombre || 'General',
        source: 'syscom',
        caracteristicas: p.caracteristicas || [],
        recursos: p.recursos || [],
        imagenesExtra: p.imagenes || [],
        alternativas
      };

    } catch(error) {
       this.logger.error('Error fetching syscom product details', error?.response?.data || error.message);
       throw new Error('Could not fetch product details');
    }
  }

  async createLocalProduct(data: any) {
    return this.prisma.storeProduct.create({ data });
  }

  async updateLocalProduct(id: string, data: any) {
    return this.prisma.storeProduct.update({ where: { id }, data });
  }

  async deleteLocalProduct(id: string) {
    return this.prisma.storeProduct.delete({ where: { id } });
  }

  async getAiSearch(search: string) {
    const data = await this.getCombinedCatalog(search, 1);
    // Retornamos un resumen optimizado para la IA para ahorrar tokens
    return data.products.map((p: any) => ({
      title: p.title,
      price: p.price,
      stock: p.stock,
      brand: p.brand,
      isSyscom: p.source === 'syscom'
    })).slice(0, 10); // Limit to top 10 results
  }

  async createOrder(data: any) {
    const { customerName, customerPhone, customerAddress, totalAmount, items } = data;
    
    const order = await this.prisma.storeOrder.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            syscomId: item.syscomId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            satKey: item.satKey || '43222609'
          }))
        }
      },
      include: { items: true }
    });

    try {
      // Create MercadoPago checkout link
      const paymentPref = await this.mercadopagoService.createStorePreference(order);
      return { order, checkoutUrl: paymentPref.url };
    } catch (e) {
      this.logger.error("Error creating MercadoPago preference for StoreOrder", e);
      // Even if MercadoPago fails, we return the order so it is saved
      return { order, checkoutUrl: null };
    }
  }

  async getOrders() {
    return this.prisma.storeOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.storeOrder.update({
      where: { id },
      data: { status }
    });
  }

  async invoiceOrder(id: string) {
    const order = await this.prisma.storeOrder.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found');

    // Simular creación de CFDI 4.0 en FacturaPro
    const facturaId = `FPRO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.storeOrder.update({
      where: { id },
      data: {
        isFacturado: true,
        facturaId
      }
    });
  }
}
