import { useState } from "react";
import { tenantService } from "../services/api";

import TenantForm from "../components/tenants/TenantForm.jsx";
import Modal from "../../../ui-library/src/components/Modal.jsx";

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTenant = async (formData) => {
    try {
      const response = await tenantService.create(formData);
      if (response.success) {
        //fetchTenants(); // Refetch to update the list
        setIsModalOpen(false); // Close modal on success
      }
    } catch (err) {
      // The form can display this error
      return err.response?.data?.error || "Failed to create tenant.";
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Create New Tenant
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TenantForm onSubmit={handleCreateTenant} />
      </Modal>
    </div>
  );
}

export default Dashboard;
