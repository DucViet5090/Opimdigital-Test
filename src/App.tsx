import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Banner, base64ToFile, convertToBase64 } from "./Banner";
import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
} from "./BannerService";

const App: React.FC = () => {
  useEffect(() => {
    getBanners().then((data) => setBanners(data));
  }, []);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [form, setForm] = useState<Banner>({
    group: "",
    name: "",
    link: "",
    order: 0,
    texts: [""],
    image: {},
    status: "Hiển thị",
    create_date: new Date().toLocaleDateString("en-GB"),
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setSelectedFile(null);
    setIsEdit(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setForm({
      group: "",
      name: "",
      link: "",
      order: 0,
      texts: [""],
      image: {},
      status: "Hiển thị",
      create_date: new Date().toLocaleDateString("en-GB"),
    });
    setIsPopupOpen(false);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleChangeImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    const { name } = event.target;

    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      try {
        const base64 = await convertToBase64(file);
        setForm({ ...form, [name]: { name: file.name, data: base64 } });
        setErrors({ ...errors, [name]: "" });
      } catch (error) {
        console.error("Error converting file:", error);
      }
    }
  };

  const handleTextChange = (index: number, value: string) => {
    const updatedTexts = [...form.texts];
    updatedTexts[index] = value;
    setForm({ ...form, texts: updatedTexts });
    setErrors({ ...errors, [`texts_${index}`]: "" });
  };

  const handleAddText = () => {
    setForm({ ...form, texts: [...form.texts, ""] });
  };
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.group) {
      newErrors.group = "Vui lòng chọn nhóm banner.";
    }
    if (!form.name.trim()) {
      newErrors.name = "Tên banner không được để trống.";
    }
    if (!form.link.trim() || !/^https?:\/\/.+$/.test(form.link)) {
      newErrors.link = "Liên kết không hợp lệ. Hãy nhập một URL hợp lệ.";
    }
    if (form.order <= 0) {
      newErrors.order = "Thứ tự phải là một số lớn hơn 0.";
    }
    form.texts.forEach((text, index) => {
      if (!text.trim()) {
        newErrors[`texts_${index}`] = `Văn bản ${
          index + 1
        } không được để trống.`;
      }
    });
    if (Object.keys(form.image).length === 0) {
      newErrors.image = "Tên tệp hình ảnh không được để trống.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    console.log("🚀 ~ handleSubmit ~ isEdit:", isEdit)
    if (!isEdit) {
      await createBanner(form);
    } else {
      await updateBanner(form.id!, form);
    }
    await getBanners().then((data) => {
      setBanners(data);
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setForm({
      group: "",
      name: "",
      link: "",
      order: 0,
      texts: [""],
      image: {},
      status: "Hiển thị",
      create_date: new Date().toLocaleDateString("en-GB"),
    });
    handleClosePopup();
  };

  const handleEdit = (banner: Banner) => {
    setIsEdit(true);
    if (banner.image.data) {
      setSelectedFile(base64ToFile(banner.image.data, banner.image.name!));
      if (fileInputRef.current)
        fileInputRef.current!.value = banner.image.name!;
    }
    setForm(banner);
    handleOpenPopup();
  };

  const handleDelete = async (id: string) => {
    await deleteBanner(id);
    await getBanners().then((data) => setBanners(data));
  };
  const handleRemoveText = (index: number) => {
    const updatedTexts = form.texts.filter((_, i) => i !== index);
    setForm({ ...form, texts: updatedTexts });
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setForm({ ...form, image: {} });
  };
  return (
    <div className="container">
      <h1 className="title">Quản lý Banner</h1>
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="form-container">
              <div className="form-item">
                <div className="item-label">
                  <label>Group</label>
                </div>
                <div className="item-control">
                  <select
                    name="group"
                    value={form.group}
                    className="short-input"
                    onChange={handleChange}
                  >
                    <option value="">Chọn nhóm banner</option>
                    <option value="Banner chính">Banner chính</option>
                  </select>
                  {errors.group && (
                    <span className="error-message">{errors.group}</span>
                  )}
                </div>
              </div>
              <div className="form-item">
                <div className="item-label">
                  <label>Name</label>
                </div>
                <div className="item-control">
                  <input
                    className="long-input"
                    type="text"
                    name="name"
                    placeholder="Tên banner"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>
              </div>
              <div className="form-item">
                <div className="item-label">
                  <label>Link</label>
                </div>
                <div className="item-control">
                  <input
                    className="long-input"
                    type="text"
                    name="link"
                    placeholder="Liên kết"
                    value={form.link}
                    onChange={handleChange}
                  />
                  {errors.link && (
                    <span className="error-message">{errors.link}</span>
                  )}
                </div>
              </div>
              <div className="form-item">
                <div className="item-label">
                  <label>Index</label>
                </div>
                <div className="item-control">
                  <input
                    type="number"
                    name="order"
                    placeholder="Thứ tự"
                    value={form.order}
                    onChange={handleChange}
                    className="short-input"
                  />
                  <span style={{ marginLeft: "5px" }}>
                    * Larger numbers will be displayed first.
                  </span>
                  {errors.order && (
                    <span className="error-message">{errors.order}</span>
                  )}
                </div>
              </div>
              {form.texts.map((text, index) => (
                <div className="form-item" key={index}>
                  <div className="item-label">
                    <label>Text {index + 1}</label>
                  </div>
                  <div className="item-control">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      placeholder={`Văn bản ${index + 1}`}
                      className="long-input texts-input"
                    />
                    {form.texts.length > 1 && (
                      <button
                        onClick={() => handleRemoveText(index)}
                        className="remove-btn"
                      >
                        X
                      </button>
                    )}
                    {errors[`texts_${index}`] && (
                      <span className="error-message">
                        {errors[`texts_${index}`]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={handleAddText} className="add-text-btn">
                Add text +
              </button>
              <div className="form-item">
                <div className="item-label">
                  <label>Image</label>
                </div>
                <div className="item-control">
                  {selectedFile && (
                    <div style={{ margin: "5px" }}>
                      <span>{selectedFile.name}</span>
                      <button
                        className="remove-file-button"
                        onClick={handleFileRemove}
                      >
                        Xóa tệp
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    placeholder="Tên tệp hình ảnh"
                    className="long-input custom-file-upload"
                    onChange={handleChangeImage}
                    ref={fileInputRef}
                  />
                  {errors.image && (
                    <span className="error-message">{errors.image}</span>
                  )}
                </div>
              </div>
              <div className="form-item">
                <div className="item-label">
                  <label>Status</label>
                </div>
                <div className="item-control">
                  <label>
                    <input
                      className="radio"
                      type="radio"
                      name="status"
                      value="Hiển thị"
                      checked={form.status === "Hiển thị"}
                      onChange={handleChange}
                    />{" "}
                    Hiển thị
                  </label>
                  <label>
                    <input
                      className="radio"
                      type="radio"
                      name="status"
                      value="Tạm dừng"
                      checked={form.status === "Tạm dừng"}
                      onChange={handleChange}
                    />{" "}
                    Tạm dừng
                  </label>
                </div>
              </div>
              <div className="btn-group">
                <button onClick={handleClosePopup} className="btn cancel-btn">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="btn submit-btn">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="content">
        <button onClick={handleOpenPopup} className="top-button">
          {"Add"}
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thứ tự</th>
              <th>Tên banner</th>
              <th>Liên kết</th>
              <th>Văn bản</th>
              <th>Hình ảnh</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Chỉnh sửa</th>
              <th>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td>{banner.id}</td>
                <td>{banner.order}</td>
                <td>{banner.name}</td>
                <td>{banner.link}</td>
                <td>
                  {" "}
                  {banner.texts.map((text, index) => (
                    <React.Fragment key={index}>
                      {text}
                      {index < banner.texts.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </td>
                <td>
                  <img src={banner.image.data} alt="" />
                </td>
                <td>{banner.create_date}</td>
                <td>{banner.status}</td>
                <td>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="edit-btn"
                  >
                    Chỉnh sửa
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(banner.id!)}
                    className="delete-btn"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
