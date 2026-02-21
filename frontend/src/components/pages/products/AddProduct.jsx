import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { FaFileUpload, FaFilePdf, FaFileWord, FaFile, FaTimes, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";


function AddProduct() {
  const navigate = useNavigate();

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
    price: "",
    documents: [],
  });

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const mapOptions = (arr) =>
    arr.map((i) => ({ value: i.id, label: i.name }));

  const fetchDropdowns = async () => {
    try {
      const [cat, ven, dep, stat] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/categories/'),
        axios.get('http://127.0.0.1:8000/api/vendors/'),
        axios.get('http://127.0.0.1:8000/api/departments/'),
      ]);

      setCategories(mapOptions(cat.data.results));
      setVendors(mapOptions(ven.data.results));
      setDepartments(mapOptions(dep.data.results));
    } catch (err) {
      console.error(err);
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
    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("model_number", form.model_number);
      data.append("serial_number", form.serial_number);
      data.append("category", form.category?.value || "");
      data.append("vendor", form.vendor?.value || "");
      data.append("current_department", form.current_department?.value || "");
      data.append("description", form.description);
      data.append(
        "purchase_date",
        form.purchase_date
          ? form.purchase_date.toISOString().split("T")[0]
          : ""
      );
      data.append("warranty_years", form.warranty_years);
      data.append("price", form.price);
      
      if (form.documents) {
        form.documents.forEach((file) => {
        data.append("documents", file);
    });
    }

      await axios.post('http://127.0.0.1:8000/api/products/', data, {headers: { "Content-Type": "multipart/form-data" }});
      toast.success("Product Added Successfully");
      navigate("/products");
    } catch (err) {
      toast.error("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
          Add New Product
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              name="name"
              placeholder="Enter product name"
              required
              className={inputStyle}
              onChange={handleInput}
            />
          </div>

           {/* Model Number */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Model Number
            </label>
            <input
              name="model_number"
              placeholder="Model Number"
              className={inputStyle}
              onChange={handleInput}
            />
          </div>

          {/* Serial Number */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Serial Number
            </label>
            <input
              name="serial_number"
              placeholder="Serial Number"
              className={inputStyle}
              onChange={handleInput}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select
              placeholder="Select Category"
              required
              options={categories}
              value={form.category}
              onChange={(v) => handleSelect("category", v)}
            />
          </div>

          {/* Vendor */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <Select
              placeholder="Select Vendor"
              required
              options={vendors}
              value={form.vendor}
              onChange={(v) => handleSelect("vendor", v)}
            />
          </div>

          {/* Department */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Select
              placeholder="Select Department"
              required
              options={departments}
              value={form.current_department}
              onChange={(v) => handleSelect("current_department", v)}
            />
          </div>

         

          {/* Purchase Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <DatePicker
              selected={form.purchase_date}
              onChange={(date) => setForm({ ...form, purchase_date: date })}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className={inputStyle}
            />
          </div>

          {/* Warranty Years */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Warranty Years
            </label>
            <input
              type="number"
              name="warranty_years"
              placeholder="Warranty Years"
              className={inputStyle}
              onChange={handleInput}
            />
          </div>


          {/* Price */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              name="price"
              placeholder="Price"
              className={inputStyle}
              onChange={handleInput}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Description"
              rows="3"
              className={inputStyle}
              onChange={handleInput}
            />
          </div>

            {/* --- File Upload --- */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>

              {/* Hidden file input */}
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

              {/* Upload button */}
              <button
                type="button"
                onClick={() => document.getElementById("fileUpload").click()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg w-48 text-left flex items-center justify-between"
              >
                <span>{form.documents?.length > 0 ? `${form.documents.length} file(s)` : "Choose Files"}</span><FaFileUpload className="ml-2" />
              </button>

              {/* Display selected files */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {form.documents?.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm p-2 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {/* File type icon */}
                      <span className="text-xl">
                        {file.name.endsWith(".pdf") ? <FaFilePdf className="text-red-500" /> : file.name.endsWith(".docx") || file.name.endsWith(".doc") ? <FaFileWord className="text-blue-500" /> : <FaFile className="text-gray-500" />}
                      </span>

                      {/* File name & size */}
                      <div className="truncate text-sm">
                        <p className="truncate w-36">{file.name}</p>
                        <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    {/* Remove button */}
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
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>




          {/* Submit */}
         <div className="flex justify-end items-center gap-3 md:col-span-2 mt-4">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
            >
              Cancel
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition"
            >
              {loading && <FaSpinner className="animate-spin text-white" />}
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
