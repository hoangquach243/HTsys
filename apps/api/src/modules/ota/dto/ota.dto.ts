export class CreateOtaChannelDto {
    name: string; // e.g Booking.com
    type: string; // e.g booking_com
    credentials?: any; // JSON with api keys / hotel id
    isActive?: boolean;
    propertyId: string;
}

export class UpdateOtaChannelDto {
    name?: string;
    type?: string;
    credentials?: any;
    isActive?: boolean;
}

export class CreateOtaMappingDto {
    channelId: string;
    roomTypeId: string;
    externalRoomId: string;
    externalRateId?: string;
}

// Mock payload for incoming OTA webhook
export class OtaWebhookDto {
    channelType: string;
    hotelId: string;
    reservationId: string;
    externalRoomId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: 'NEW' | 'MODIFIED' | 'CANCELLED';
    totalPrice: number;
}
