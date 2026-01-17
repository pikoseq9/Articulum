import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Car } from "../utils/types";
import api from "../axios";

export default function Details() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [car, setCar] = useState<Car | null>(null);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const res = await api.get<Car>(`/Cars/${id}`);
                setCar(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCar();
    }, [id]);

    if (!car) {
        return <h2>Ładowanie...</h2>;
    }

    return (
        <>
            <button className="back-btn" onClick={() => navigate("/")}>
                Powrót
            </button>

            <div className="details-card">
                <h1>{car.brand} {car.model}</h1>

                <div className="details-grid">
                    <div>
                        <strong>Marka:</strong> {car.brand}
                    </div>
                    <div>
                        <strong>Model:</strong> {car.model}
                    </div>
                    <div>
                        <strong>Liczba drzwi:</strong> {car.doorsNumber}
                    </div>
                    <div>
                        <strong>Pojemność bagażnika:</strong> {car.luggageCapacity}
                    </div>
                    <div>
                        <strong>Pojemność silnika:</strong> {car.engineCapacity}
                    </div>
                    <div>
                        <strong>Typ paliwa:</strong> {car.fuelType}
                    </div>
                    <div>
                        <strong>Data produkcji:</strong> {car.productionDate?.split("T")[0]}
                    </div>
                    <div>
                        <strong>Spalanie:</strong> {car.carFuelConsumption}
                    </div>
                    <div>
                        <strong>Typ nadwozia:</strong> {car.bodyType}
                    </div>
                </div>
            </div>
        </>
    );
}
