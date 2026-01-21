import React from "react";
import { Chart } from "react-google-charts";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"; 
import { Head } from "@inertiajs/react";

// El nombre de la función debe coincidir con el estándar de React (Mayúscula)
// Y debe llevar el 'export default'
export default function DashboardCoordinador({ auth }) {
  const data = [
    ["Tarea", "Horas por día"],
    ["Trabajo", 9],
    ["Comida", 2],
    ["Viaje", 2],
    ["TV", 2],
    ["Dormir", 7],
  ];

  const options = {
    title: "Mis Actividades Diarias",
  };

  return (
    // Envolvemos en el Layout para que no salga la pantalla vacía
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Coordinador</h2>}
    >
      <Head title="Dashboard Coordinador" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white p-6 overflow-hidden shadow-sm sm:rounded-lg">
            <Chart
              chartType="PieChart"
              data={data}
              options={options}
              width={"100%"}
              height={"400px"}
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}