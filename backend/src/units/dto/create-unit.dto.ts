export class CreateUnitDto {
  propertyId: string;
  name: string;
  basePrice: number;
  photos?: string;
  description?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  isFurnished?: boolean;
  amenities?: string;
}
