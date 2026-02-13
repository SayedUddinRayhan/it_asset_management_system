import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { FaFileUpload, FaFilePdf, FaFileWord, FaFile, FaTrash, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [form, setForm] = useState({
    name: "",
    model_number: "",
    serial_number: "",
    category: null,
    vendor: null,
    current_department: null,
    description: "",
    purchase_date: null,
    warranty_years: "",
    quantity: 0,
    price: 0,
    documents: [],
  });

  const [existingDocs, setExistingDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdowns();
    fetchProduct();
  }, []);

  
  const mapOptions = (arr) => arr.map((i) => ({ value: i.id, label: i.name }));

  const fetchDropdowns = async () => {
    try {
      const [cat, ven, dep, stat] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/categories/"),
        axios.get("http://127.0.0.1:8000/api/vendors/"),
        axios.get("http://127.0.0.1:8000/api/departments/"),
      ]);

      setCategories(mapOptions(cat.data.results));
      setVendors(mapOptions(ven.data.results));
      setDepartments(mapOptions(dep.data.results));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);
      const p = res.data;

      setForm({
        name: p.name,
        model_number: p.model_number,
        serial_number: p.serial_number,
        category: p.category ? { value: p.category, label: p.category_name } : null,
        vendor: p.vendor ? { value: p.vendor, label: p.vendor_name } : null,
        current_department: p.current_department
          ? { value: p.current_department, label: p.department_name }
          : null,
        description: p.description,
        purchase_date: p.purchase_date ? new Date(p.purchase_date) : null,
        warranty_years: p.warranty_years,
        quantity: p.quantity,
        price: p.price,
        documents: [],
      });

      setExistingDocs(p.documents || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch product");
    }
  };

  const handleInput = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSelect = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category || !form.vendor || !form.current_department) {
      alert("Category, Vendor, and Department are required");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("model_number", form.model_number);
      data.append("serial_number", form.serial_number);
      data.append("category", form.category.value);
      data.append("vendor", form.vendor.value);
      data.append("current_department", form.current_department.value);
      data.append("description", form.description);
      data.append(
        "purchase_date",
        form.purchase_date ? form.purchase_date.toISOString().split("T")[0] : ""
      );
      data.append("warranty_years", form.warranty_years);
      data.append("quantity", form.quantity);
      data.append("price", form.price);


      form.documents.forEach((file) => data.append("documents", file));

      await axios.put(`http://127.0.0.1:8000/api/products/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully");
      navigate("/products");
    } catch (err) {
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExistingDoc = async (docId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/product-documents/${docId}/`);
      setExistingDocs(existingDocs.filter((d) => d.id !== docId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete document");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              name="name"
              value={form.name}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none w-full text-sm"
              onChange={handleInput}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select
              placeholder="Select Category"
              options={categories}
              value={form.category}
              onChange={(v) => handleSelect("category", v)}
            />
          </div>

          {/* Vendor */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <Select
              placeholder="Select Vendor"
              options={vendors}
              value={form.vendor}
              onChange={(v) => handleSelect("vendor", v)}
            />
          </div>

          {/* Department */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Department</label>
            <Select
              placeholder="Select Department"
              options={departments}
              value={form.current_department}
              onChange={(v) => handleSelect("current_department", v)}
            />
          </div>


          {/* Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              min={1}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none w-full text-sm"
              onChange={handleInput}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={form.price}
              step="0.01"
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none w-full text-sm"
              onChange={handleInput}
            />
          </div>

          {/* Purchase Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
            <DatePicker
              selected={form.purchase_date}
              onChange={(date) => setForm({ ...form, purchase_date: date })}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none w-full text-sm"
            />
          </div>

          {/* Warranty */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Warranty Years</label>
            <input
              type="number"
              name="warranty_years"
              value={form.warranty_years}
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none w-full text-sm"
              onChange={handleInput}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              rows={3}
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none w-full text-sm"
              onChange={handleInput}
            />
          </div>

        
          {existingDocs.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="font-medium mb-2">Existing Documents</h3>
              <div className="flex flex-wrap gap-2">
                {existingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
                  >
                    <a
                      href={doc.file}
                      target="_blank"
                      className="text-blue-600 truncate"
                    >
                      {doc.file.split("/").pop()}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingDoc(doc.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Upload Documents
            </label>

            <input
              type="file"
              multiple
              id="fileUpload"
              className="hidden"
              onChange={(e) => {
                const filesArray = Array.from(e.target.files);
                setForm({
                  ...form,
                  documents: [...(form.documents || []), ...filesArray],
                });
                e.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => document.getElementById("fileUpload").click()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg w-48 text-left flex items-center justify-between"
            >
              <span>
                {form.documents?.length > 0
                  ? `${form.documents.length} file(s)`
                  : "Choose Files"}
              </span>
              <FaFileUpload className="ml-2" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {form.documents?.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm p-2 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xl">
                      {file.name.endsWith(".pdf") ? (
                        <FaFilePdf className="text-red-500" />
                      ) : file.name.endsWith(".docx") || file.name.endsWith(".doc") ? (
                        <FaFileWord className="text-blue-500" />
                      ) : (
                        <FaFile className="text-gray-500" />
                      )}
                    </span>
                    <div className="truncate text-sm">
                      <p className="truncate w-36">{file.name}</p>
                      <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        documents: form.documents.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded-md font-semibold text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          
            {/* Cancel & Submit */}
            <div className="flex justify-end items-center gap-3 md:col-span-2 mt-4">

                <button
                type="button"
                onClick={() => navigate("/products")} 
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
                >
                Cancel
                </button>


                <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition"
                >
                {loading && <FaSpinner className="animate-spin text-white" />}
                {loading ? "Updating..." : "Update Product"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
