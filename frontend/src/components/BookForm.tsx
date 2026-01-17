import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Car,
  CarCreateUpdate,
  FuelTypeMap,
  BodyTypeMap,
  FuelTypeReverseMap,
  BodyTypeReverseMap,
  FuelType,
  BodyType
} from "../utils/types";
import api from "../axios";
import { useAuth } from "../authContext";

export default function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const user = useAuth();

  const [form, setForm] = useState<CarCreateUpdate>({
    brand: "",
    model: "",
    doorsNumber: 3,
    luggageCapacity: 0,
    engineCapacity: 0,
    fuelType: FuelType.Diesel,
    productionDate: "",
    carFuelConsumption: 0,
    bodyType: BodyType.Hatchback
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CarCreateUpdate, string>>>({});

  useEffect(() => {
    if (!isEdit || !user) return;

    const fetchCar = async () => {
      try {
        const res = await  api.get<Car>(`/Cars/${id}`);
        const car = res.data;

        setForm({
          brand: car.brand ?? "",
          model: car.model ?? "",
          doorsNumber: car.doorsNumber ?? 3,
          luggageCapacity: car.luggageCapacity ?? 0,
          engineCapacity: car.engineCapacity ?? 0,
          fuelType: FuelTypeMap[Number(car.fuelType)],
          productionDate: car.productionDate ? car.productionDate.split("T")[0] : "",
          carFuelConsumption: car.carFuelConsumption ?? 0,
          bodyType: BodyTypeMap[Number(car.bodyType)]
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchCar();
  }, [isEdit, id, user]);

  const update = (field: keyof CarCreateUpdate, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined })); // usuń błąd przy zmianie pola
  };

  const validate = () => {
  const newErrors: Partial<Record<keyof CarCreateUpdate, string>> = {};

  if (!form.brand.trim()) newErrors.brand = "Marka jest wymagana";
  if (!form.model.trim()) newErrors.model = "Model jest wymagany";
  if (form.doorsNumber <= 0) newErrors.doorsNumber = "Liczba drzwi musi być większa niż 0";
  if (form.luggageCapacity <= 0) newErrors.luggageCapacity = "Pojemność bagażnika nie może być ujemna lub 0";
  if (form.engineCapacity <= 0) newErrors.engineCapacity = "Pojemność silnika musi być większa niż 0";
  if (form.carFuelConsumption <= 0) newErrors.carFuelConsumption = "Spalanie nie może być ujemne lub 0";
  if (form.carFuelConsumption > 20) newErrors.carFuelConsumption = "Spalanie nie może przekraczać 20 l/100km";
  if (!form.productionDate) {
    newErrors.productionDate = "Data produkcji jest wymagana";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const prepared = {
      ...form,
      productionDate: form.productionDate || null,
      fuelType: FuelTypeReverseMap[form.fuelType as FuelType],
      bodyType: BodyTypeReverseMap[form.bodyType as BodyType]
    };

    const request = isEdit
      ? api.put(`/Cars/${id}`, prepared)
      : api.post(`/Cars/`, prepared);

    request.then(() => navigate("/")).catch(console.error);
  };

  return (
    <>
      <button className="back-btn" onClick={() => navigate("/")}>Powrót</button>
      <h1>{isEdit ? "Edytuj samochód" : "Dodaj samochód"}</h1>
      <form onSubmit={handleSubmit} className="car-form">
        <label>
          Marka:
          <input type="text" maxLength={20} value={form.brand} onChange={e => update("brand", e.target.value)} />
          {errors.brand && <div className="error">{errors.brand}</div>}
        </label>

        <label>
          Model:
          <input type="text" maxLength={20} value={form.model} onChange={e => update("model", e.target.value)} />
          {errors.model && <div className="error">{errors.model}</div>}
        </label>

        <label>
          Liczba drzwi:
          <input type="number" min={1} maxLength={10} value={form.doorsNumber || ""} onChange={e => update("doorsNumber", Number(e.target.value))} />
          {errors.doorsNumber && <div className="error">{errors.doorsNumber}</div>}
        </label>

        <label>
          Pojemność bagażnika:
          <input type="number" min={0} maxLength={10} max={3000} value={form.luggageCapacity || ""} onChange={e => update("luggageCapacity", Number(e.target.value))} />
          {errors.luggageCapacity && <div className="error">{errors.luggageCapacity}</div>}
        </label>

        <label>
          Pojemność silnika:
          <input type="number" min={0} maxLength={10} max={2000} value={form.engineCapacity || ""} onChange={e => update("engineCapacity", Number(e.target.value))} />
          {errors.engineCapacity && <div className="error">{errors.engineCapacity}</div>}
        </label>

        <label>
            Data produkcji:
            <input type="date" value={form.productionDate} onChange={e => update("productionDate", e.target.value)} />
            {errors.productionDate && <div className="error">{errors.productionDate}</div>}
        </label>

        <label>
            Spalanie:
            <input type="number" step="0.1" min={0} max={20} value={form.carFuelConsumption || ""} onChange={e => update("carFuelConsumption", parseFloat(e.target.value))} />
            {errors.carFuelConsumption && <div className="error">{errors.carFuelConsumption}</div>}
        </label>


        <label>
          Paliwo:
          <select value={form.fuelType} onChange={e => update("fuelType", e.target.value as FuelType)}>
            {Object.values(FuelType).map(ft => <option key={ft} value={ft}>{ft}</option>)}
          </select>
        </label>

        <label>
          Typ nadwozia:
          <select value={form.bodyType} onChange={e => update("bodyType", e.target.value as BodyType)}>
            {Object.values(BodyType).map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </label>

        <div className="buttons">
          <button type="submit">{isEdit ? "Zapisz zmiany" : "Dodaj"}</button>
          <button type="button" onClick={() => navigate("/")}>Anuluj</button>
        </div>
      </form>
    </>
  );
}
