import { useNavigate } from 'react-router-dom';
import api from '../axios';

export const usePdfOpener = () => {
    const navigate = useNavigate();

    const openPdf = async (id: string) => {
        const newTab = window.open('', '_blank');
        
        if (newTab) {
            newTab.document.title = "Ładowanie dokumentu...";
            newTab.document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #555;">
                    <h2>Pobieranie pliku PDF...</h2>
                </div>
            `;
        }

        try {
            const response = await api.get(`/api/Articles/${id}/view`, { responseType: 'blob' });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            
            if (newTab) {
                newTab.location.href = fileURL;
            }
        } catch (error: any) {
            if (newTab) {
                newTab.close();
            }
            
            // 404
            if (error.response && error.response.status === 404) {
                navigate('/not-found');
            } else {
                alert("Wystąpił nieoczekiwany błąd podczas pobierania pliku.");
            }
        }
    };

    return { openPdf };
};