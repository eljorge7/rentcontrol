import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testResend() {
  console.log("Iniciando prueba de API Resend...");
  try {
    // 1. Fetch API Key from DB
    const passSetting = await prisma.systemSetting.findUnique({ where: { key: 'SMTP_PASS' } });
    const apiToken = passSetting?.value;
    
    if (!apiToken || !apiToken.startsWith('re_')) {
      console.error("❌ Error: No se encontró una API Key de Resend válida en la Base de Datos. Pégala en 'Ajustes Generales' primero.");
      process.exit(1);
    }
    
    console.log(`✅ API Key detectada (${apiToken.slice(0, 7)}...). Conectando con api.resend.com...`);

    // 2. Fetch API using the configured payload
    const testPayload = {
      from: 'Ecosistema Agency OS <notificaciones@radiotecpro.com>',
      reply_to: 'jorge.hurtado@radiotecpro.com',
      to: ['jorge.hurtado@radiotecpro.com'],
      subject: 'The Agency OS - Conexión M2M de Prueba 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
             <h1 style="color: white; margin: 0; font-size: 24px;">Prueba de Conexión en Vivo</h1>
          </div>
          <div style="padding: 32px; background-color: #ffffff;">
             <h2 style="color: #1f2937; font-size: 20px; font-weight: bold; margin-top: 0;">¡Los Dominios están Certificados!</h2>
             <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hola, Jorge.</p>
             <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Si estás leyendo este correo oficializado, significa que GoDaddy, tu VPS y la arquitectura de The Agency OS están comunicándose de manera impecable.</p>
             
             <div style="background-color: #f3f4f6; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
               <p style="margin: 0; color: #374151; font-weight: bold;">Status de Envío: <span style="color: #10b981;">100% Blindado (Anti-Spam M2M)</span></p>
             </div>

             <p style="color: #4b5563; font-size: 14px; margin-top: 32px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px;">
               Generado automáticamente por el Ecosistema B2B de RentControl y FacturaPro.
             </p>
          </div>
        </div>
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();
    
    if (response.ok) {
       console.log(`✅ ¡ÉXITO! Correo inyectado a los servidores de GoDaddy-Resend.`);
       console.log(`📡 ID del Mensaje en la Nube: ${data.id}`);
       console.log(`Revisa la bandeja de entrada de jorge.hurtado@radiotecpro.com`);
    } else {
       console.error(`❌ El servidor devolvió error HTTP:`, data);
    }

  } catch (error) {
    console.error("❌ Código de falla catastrófica en el test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testResend();
