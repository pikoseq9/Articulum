import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <h1>404 - Strona nieznaleziona</h1>
            <button className="back-btn" onClick={() => navigate("/")}>
                Powrót
            </button>
        </>
    );
}