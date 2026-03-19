import { useState, useEffect } from 'react';
import axios from 'axios';

export function useDashboardFilters(initialInstitutoId = null, initialCarreraId = null) {
    const [institutos, setInstitutos] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [selectedInstitutoId, setSelectedInstitutoId] = useState(initialInstitutoId);
    const [selectedCarreraId, setSelectedCarreraId] = useState(initialCarreraId);
    const [loading, setLoading] = useState(false);

    // Cargar institutos al montar
    useEffect(() => {
        loadInstitutos();
    }, []);

    // Cargar carreras cuando cambia el instituto
    useEffect(() => {
        if (selectedInstitutoId) {
            loadCarreras(selectedInstitutoId);
        } else {
            setCarreras([]);
        }
    }, [selectedInstitutoId]);

    const loadInstitutos = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/institutos'); // Ajustar ruta según tu API
            setInstitutos(response.data);
        } catch (error) {
            console.error('Error cargando institutos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCarreras = async (institutoId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/institutos/${institutoId}/carreras`); // Ajustar ruta
            setCarreras(response.data);
        } catch (error) {
            console.error('Error cargando carreras:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInstitutoChange = (institutoId) => {
        setSelectedInstitutoId(institutoId);
        setSelectedCarreraId(null); // Resetear carrera al cambiar instituto
    };

    const handleCarreraChange = (carreraId) => {
        setSelectedCarreraId(carreraId);
    };

    return {
        institutos,
        carreras,
        selectedInstitutoId,
        selectedCarreraId,
        loading,
        handleInstitutoChange,
        handleCarreraChange,
    };
}