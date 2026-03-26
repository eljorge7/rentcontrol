export class CreatePropertyDto {
  name: string;
  address: string;
  description?: string;
  lat?: number;
  lng?: number;
  mapUrl?: string;
  photos?: string;
  amenities?: string;
  ownerId?: string;
}
