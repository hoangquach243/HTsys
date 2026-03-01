export class CreateEmailTemplateDto {
    name: string;
    subject: string;
    body: string;
    trigger?: string;
    isActive?: boolean;
    propertyId: string;
}

export class UpdateEmailTemplateDto {
    name?: string;
    subject?: string;
    body?: string;
    trigger?: string;
    isActive?: boolean;
}

export class CreateEmailFlowDto {
    name: string;
    triggerEvent: string;
    conditions?: any;
    actions?: any;
    isActive?: boolean;
    propertyId: string;
}

export class UpdateEmailFlowDto {
    name?: string;
    triggerEvent?: string;
    conditions?: any;
    actions?: any;
    isActive?: boolean;
}
