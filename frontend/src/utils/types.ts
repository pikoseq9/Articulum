export enum FuelType {
    Petrol = 'Petrol',
    Hybrid = 'Hybrid',
    Diesel = 'Diesel',
    LPG = 'LPG'
}


export enum BodyType {
    Hatchback = 'Hatchback', 
    Sedan = 'Sedan', 
    Kombi = 'Kombi',
    SUV = 'SUV', 
    Roadster = 'Roadster', 
}


export const FuelTypeMap: Record<number, FuelType> = {
    1: FuelType.Petrol,
    2: FuelType.Hybrid,
    3: FuelType.Diesel,
    4: FuelType.LPG
}

export const BodyTypeMap: Record<number, BodyType> = {
    1: BodyType.Hatchback,
    2: BodyType.Sedan,
    3: BodyType.Kombi,
    4: BodyType.SUV,
    5: BodyType.Roadster
}

export const FuelTypeReverseMap: Record<string, number> = {
    "Petrol": 1,
    "Hybrid": 2,
    "Diesel": 3,
    "LPG": 4
};

export const BodyTypeReverseMap: Record<string, number> = {
    "Hatchback": 1,
    "Sedan": 2,
    "Kombi": 3,
    "SUV": 4,
    "Roadster": 5
};


export interface Car {
    id: string,
    brand: string,
    model: string,
    doorsNumber: number,
    luggageCapacity: number,
    engineCapacity: number,
    fuelType: FuelType,
    productionDate: string, 
    carFuelConsumption: number,
    bodyType: BodyType
}

export interface CarCreateUpdate {
    brand: string,
    model: string,
    doorsNumber: number,
    luggageCapacity: number,
    engineCapacity: number,
    fuelType: FuelType,
    productionDate: string, 
    carFuelConsumption: number,
    bodyType: BodyType
}