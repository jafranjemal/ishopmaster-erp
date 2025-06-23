import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import * as Tabs from "@radix-ui/react-tabs";
import { tenantCurrencyService } from "../../services/api";
import { Pagination, Button, Modal, Card, CardContent } from "ui-library";
import CurrencyList from "../../components/settings/currencies/CurrencyList";
import CurrencyForm from "../../components/settings/currencies/CurrencyForm";
import ExchangeRateList from "../../components/settings/currencies/ExchangeRateList";
import ExchangeRateForm from "../../components/settings/currencies/ExchangeRateForm";

import useAuth from "../../context/useAuth";
import { PlusCircle } from "lucide-react";

const CurrenciesPage = () => {
  const { tenantProfile } = useAuth();
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "",
    data: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: "",
    data: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [currenciesRes, ratesRes] = await Promise.all([
        tenantCurrencyService.getAllCurrencies(),
        tenantCurrencyService.getExchangeRates({
          page: currentPage,
          limit: 15,
        }),
      ]);
      setCurrencies(currenciesRes.data.data);
      setExchangeRates(ratesRes.data.data);
      setPagination(ratesRes.data.pagination);
    } catch (error) {
      toast.error("Failed to load currency data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseModals = () => {
    setModalState({ isOpen: false, type: "", data: null });
    setDeleteConfirm({ isOpen: false, type: "", data: null });
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const { type, data: editingData } = modalState;
    const isEditMode = Boolean(editingData);
    let apiCall, successMessage;

    if (type === "currency") {
      apiCall = isEditMode
        ? tenantCurrencyService.updateCurrency(editingData._id, formData)
        : tenantCurrencyService.createCurrency(formData);
      successMessage = `Currency "${formData.name}" saved!`;
    } else {
      // type === 'rate'
      apiCall = tenantCurrencyService.createOrUpdateExchangeRate(formData);
      successMessage = `Exchange rate for ${formData.date} saved!`;
    }

    try {
      await toast.promise(apiCall, {
        loading: "Saving...",
        success: successMessage,
        error: (err) => err.response?.data?.error || "Failed to save.",
      });
      fetchData();
      handleCloseModals();
    } catch (error) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const { type, data } = deleteConfirm;
    if (!data) return;

    const apiCall =
      type === "currency"
        ? tenantCurrencyService.deleteCurrency(data._id)
        : tenantCurrencyService.deleteExchangeRate(data._id);
    const name =
      type === "currency"
        ? data.name
        : `rate for ${new Date(data.date).toLocaleDateString()}`;

    try {
      await toast.promise(apiCall, {
        loading: `Deleting ${name}...`,
        success: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } deleted successfully.`,
        error: (err) => err.response?.data?.error || "Failed to delete.",
      });
      fetchData();
      handleCloseModals();
    } catch (error) {
      /* handled by toast */
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Currency & Exchange Rates</h1>
      <Tabs.Root defaultValue="currencies" className="space-y-6">
        <Tabs.List className="flex border-b border-slate-700">
          <Tabs.Trigger
            value="currencies"
            className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white"
          >
            Supported Currencies
          </Tabs.Trigger>
          <Tabs.Trigger
            value="rates"
            className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white"
          >
            Exchange Rate History
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="currencies">
          <div className="text-right mb-4">
            <Button
              onClick={() =>
                setModalState({ isOpen: true, type: "currency", data: null })
              }
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Currency
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <p className="p-4">Loading...</p>
              ) : (
                <CurrencyList
                  currencies={currencies}
                  baseCurrency={
                    tenantProfile?.settings?.localization?.baseCurrency
                  }
                  onEdit={(c) =>
                    setModalState({ isOpen: true, type: "currency", data: c })
                  }
                  onDelete={(c) =>
                    setDeleteConfirm({
                      isOpen: true,
                      type: "currency",
                      data: c,
                    })
                  }
                />
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="rates">
          <ExchangeRateForm
            currencies={currencies}
            onSave={handleSave}
            isSaving={isSaving}
          />
          <div className="mt-6">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <p className="p-4">Loading...</p>
                ) : (
                  <ExchangeRateList
                    rates={exchangeRates}
                    onDelete={(r) =>
                      setDeleteConfirm({ isOpen: true, type: "rate", data: r })
                    }
                  />
                )}
                {pagination && (
                  <Pagination
                    paginationData={pagination}
                    onPageChange={setCurrentPage}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <Modal
        isOpen={modalState.isOpen && modalState.type === "currency"}
        onClose={handleCloseModals}
        title={modalState.data ? "Edit Currency" : "New Supported Currency"}
      >
        <CurrencyForm
          currencyToEdit={modalState.data}
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={handleCloseModals}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this {deleteConfirm.type}?</p>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default CurrenciesPage;
