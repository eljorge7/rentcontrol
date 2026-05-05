"use client";

import { useState, useEffect } from "react";
import { AddEmployeeDialog } from "@/components/AddEmployeeDialog";
import { EditEmployeeDialog } from "@/components/EditEmployeeDialog";
import { Trash2, Users, Search, Building2, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:3001/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      } else throw new Error("API Down");
    } catch (error) {
      console.error(error);
      setEmployees([
        {
          id: '1', name: 'Ana Lilia Garcia', email: 'ana@empresa.com', isActive: true,
          employeeProfile: { jobTitle: 'Recepcionista', department: 'Operaciones', baseSalary: 12000 }
        },
        {
          id: '2', name: 'Roberto Fernandez', email: 'roberto@empresa.com', isActive: true,
          employeeProfile: { jobTitle: 'Técnico', department: 'Soporte', baseSalary: 18000 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este empleado?")) return;
    try {
      const res = await fetch(`http://localhost:4000/employees/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Error API");
      toast.success("Empleado eliminado");
      fetchEmployees();
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  const filteredEmployees = employees.filter((e: any) => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-50/50 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center">
             <Users className="w-10 h-10 mr-3 text-indigo-600" />
             Directorio de Empleados
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Administración de expedientes de Recursos Humanos</p>
        </div>
        <AddEmployeeDialog onEmployeeAdded={fetchEmployees} />
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        <div className="mb-6 flex items-center max-w-md bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition">
           <Search className="w-5 h-5 text-slate-400 ml-3" />
           <Input 
             className="border-none bg-transparent focus-visible:ring-0 shadow-none text-base" 
             placeholder="Buscar por nombre o correo..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-600">Nombre</th>
                <th className="py-4 px-6 font-semibold text-slate-600">Puesto</th>
                <th className="py-4 px-6 font-semibold text-slate-600">Departamento</th>
                <th className="py-4 px-6 font-semibold text-slate-600">Salario Base</th>
                <th className="py-4 px-6 font-semibold text-slate-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                     <span className="animate-pulse">Cargando directorio...</span>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                     <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     No hay empleados registrados con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp: any) => (
                  <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition group">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">{emp.name}</div>
                      <div className="text-sm text-slate-500">{emp.email}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                       <span className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-indigo-400" /> {emp.employeeProfile?.jobTitle || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                       <span className="flex items-center"><Building2 className="w-4 h-4 mr-2 text-emerald-400" /> {emp.employeeProfile?.department || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-900 font-medium">
                      ${emp.employeeProfile?.baseSalary?.toLocaleString() || '0.00'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                       <EditEmployeeDialog employee={emp} onEmployeeEdited={fetchEmployees} />
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)} className="text-slate-400 hover:text-rose-600 transition">
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
