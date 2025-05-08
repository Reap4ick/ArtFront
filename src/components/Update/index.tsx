import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Update: React.FC = () => {
    const token = localStorage.getItem('token') || '';
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Стани форми
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedTechnique, setSelectedTechnique] = useState<string>('');
    const [selectedArtDirection, setSelectedArtDirection] = useState<string>('');
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedMainImage, setSelectedMainImage] = useState<string | null>(null);
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState({
        category: false,
        technique: false,
        artDirection: false
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Константи
    const categories = ['картини', 'графіка', 'скульптура', 'фотографія', 'цифрове мистецтво'];
    const techniques = [
        'олійні фарби', 'акрил', 'акварель', 'авторська', 'аерозольна фарба',
        'гуаш', 'олівець', 'колаж', 'маркер і фломастер', 'офорт',
        'монотипія', 'пастель', 'левкас', 'ручка', 'темпера', 'туш', 'емаль'
    ];
    const artDirections = [
        'абстракціонізм', 'імпресіонізм', 'кубізм', 'поп-арт', 'реалізм',
        'символізм', 'мінімалізм', 'модернізм', 'примітивізм'
    ];
    const colors = [
        { name: 'червоний', code: '#d91313' },
        { name: 'оранжевий', code: '#d97613' },
        { name: 'жовтий', code: '#c2d913' },
        { name: 'зелений', code: '#23d913' },
        { name: 'блакитний', code: '#13d9c9' },
        { name: 'синій', code: '#1316d9' },
        { name: 'фіолетовий', code: '#8a13d9' },
        { name: 'рожевий', code: '#d9138a' },
        { name: 'чорний', code: '#0d0d0d' },
        { name: 'білий', code: '#f6f6f6' },
        { name: 'коричневий', code: '#170b0b' }
    ];

    useEffect(() => {
        const fetchWork = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTitle(data.name);
                    setDescription(data.description);
                    setPrice(data.price.toString());
                    setYear(data.yearCreated.toString());
                    setSelectedCategory(data.categoryName);
                    setSelectedTechnique(data.technique);
                    setSelectedArtDirection(data.artisticDirection);
                    setSelectedSizes(data.size);
                    setSelectedFormats([data.format]);
                    setSelectedColors(data.color);
                    setSelectedMainImage(`${import.meta.env.VITE_API_URL}/images/${data.images[0]}`);
                    setAdditionalImages(data.images.slice(1).map((img: string) => `${import.meta.env.VITE_API_URL}/images/${img}`));
                } else {
                    setError('Не вдалося завантажити дані про роботу');
                }
            } catch (error) {
                setError('Помилка при завантаженні даних');
            }
        };
        fetchWork();
    }, [id]);

    const handleSubmit = async () => {
        if (!title || !description || !price) {
            setError("Заповніть обов'язкові поля");
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('token', token);
        formData.append('Name', title);
        formData.append('Description', description);
        formData.append('Price', price);
        formData.append('YearCreated', year);
        formData.append('CategoryName', selectedCategory);
        formData.append('Technique', selectedTechnique);
        formData.append('Format', selectedFormats[0] || '');
        formData.append('ArtisticDirection', selectedArtDirection);
        selectedSizes.forEach(size => formData.append('Size', size));
        selectedColors.forEach(color => formData.append('Color', color));

        if (mainImageFile) formData.append('NewImages', mainImageFile);
        additionalImageFiles.forEach(file => formData.append('NewImages', file));

        if (!mainImageFile && additionalImageFiles.length === 0) {
            formData.append('NewImages', new File([], 'empty'));
        }

        imagesToDelete.forEach(image => formData.append('ImagesToDelete', image));

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Products/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                setIsSuccess(true);
                setModalMessage('Роботу успішно оновлено!');
                setModalOpen(true);
            } else {
                const errorText = await response.text();
                setIsSuccess(false);
                setModalMessage(`Помилка: ${errorText}`);
                setModalOpen(true);
            }
        } catch (error) {
            setIsSuccess(false);
            setModalMessage('Помилка при оновленні роботи');
            setModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        if (isSuccess) navigate('/profile');
    };

    const toggleDropdown = (type: 'category' | 'technique' | 'artDirection') => {
        setDropdownOpen(prev => ({
            category: false,
            technique: false,
            artDirection: false,
            [type]: !prev[type]
        }));
    };

    const handleSelect = (value: string, type: 'category' | 'technique' | 'artDirection') => {
        switch (type) {
            case 'category': setSelectedCategory(value); break;
            case 'technique': setSelectedTechnique(value); break;
            case 'artDirection': setSelectedArtDirection(value); break;
        }
        setDropdownOpen(prev => ({ ...prev, [type]: false }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            setSelectedMainImage(URL.createObjectURL(file));
        }
    };

    const handleAdditionalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files).slice(0, 5 - additionalImageFiles.length);
        setAdditionalImageFiles(prev => [...prev, ...newFiles]);
        setAdditionalImages(prev => [...prev, ...newFiles.map(file => URL.createObjectURL(file))]);
    };

    const deleteImage = (index: number) => {
        if (index === -1) {
            if (selectedMainImage) {
                URL.revokeObjectURL(selectedMainImage);
                setImagesToDelete(prev => [...prev, selectedMainImage]);
                setSelectedMainImage(null);
                setMainImageFile(null);
            }
        } else {
            const imageToDelete = additionalImages[index];
            URL.revokeObjectURL(imageToDelete);
            setImagesToDelete(prev => [...prev, imageToDelete]);
            setAdditionalImages(prev => prev.filter((_, i) => i !== index));
            setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
        }
    };

    return (
        
        <div className="w-[1340px] relative bg-[#080217] overflow-hidden -ml-16">
            
            
            <div className="w-[1440px] h-[1350px] relative bg-[#080217] overflow-hidden">
                {/* Основне зображення */}
                <div className="left-[110px] top-[250px] absolute text-white text-base">Основне зображення</div>
                {!selectedMainImage ? (
                    <label className="h-[146px] p-4 left-[110px] top-[286px] absolute bg-[#efc2ff]/20 rounded-lg border border-[#e6dfe7] flex-col justify-start items-center gap-4 inline-flex cursor-pointer">
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M41.4929 20.9197L41.4836 20.8822L36.2242 7.51816C35.9898 6.76348 35.2914 6.24316 34.4992 6.24316H13.1804C12.3836 6.24316 11.6757 6.77285 11.4507 7.53691L6.53355 20.765L6.51949 20.7979L6.51012 20.8354C6.44918 21.065 6.43043 21.2994 6.46324 21.5291C6.45855 21.6041 6.45387 21.6791 6.45387 21.7541V38.9057C6.45511 39.6611 6.75577 40.3853 7.28998 40.9195C7.82419 41.4538 8.54838 41.7544 9.30387 41.7557H38.7039C40.2742 41.7557 41.5539 40.476 41.5586 38.9057V21.7541C41.5586 21.6932 41.5586 21.6322 41.5539 21.5807C41.5726 21.351 41.5539 21.1307 41.4929 20.9197ZM27.6273 18.9041L27.6132 19.64C27.5757 21.7447 26.1226 23.1604 23.9992 23.1604C22.9632 23.1604 22.0726 22.8275 21.4304 22.1947C20.7882 21.5619 20.4367 20.6807 20.4179 19.64L20.4039 18.9041H10.757L14.4836 9.84316H33.1961L37.0257 18.9041H27.6273ZM10.0492 22.5041H17.4226C18.5617 25.1807 20.9851 26.7604 24.0039 26.7604C25.5836 26.7604 27.0507 26.3197 28.2367 25.4853C29.2773 24.7541 30.0882 23.7322 30.6132 22.5041H37.9492V38.1557H10.0492V22.5041Z" fill="#FF7086" />
                        </svg>
                        <div className="text-center">
                            <div className="text-[#e6dfe7] text-base">Click or drag file to upload</div>
                            <div className="text-[#bc98c8] text-sm">Support for a single upload</div>
                        </div>
                    </label>
                ) : (
                    <div className="left-[110px] top-[286px] absolute">
                        <img className="w-[346px] h-[260.05px] object-cover" src={selectedMainImage} alt="Main upload" />
                        <button onClick={() => deleteImage(-1)} className="absolute top-2 right-2 bg-[#BC98C9] rounded-full p-1.5">
                            <svg width="20" height="20" viewBox="0 0 32 32" fill="#410C55">
                                <path d="M12.0417 7.8H11.8333C11.9479 7.8 12.0417 7.71 12.0417 7.6V7.8H19.9583V7.6C19.9583 7.71 20.0521 7.8 20.1667 7.8H19.9583V9.6H21.8333V7.6C21.8333 6.7175 21.0859 6 20.1667 6H11.8333C10.9141 6 10.1667 6.7175 10.1667 7.6V9.6H12.0417V7.8ZM25.1667 9.6H6.83333C6.3724 9.6 6 9.9575 6 10.4V11.2C6 11.31 6.09375 11.4 6.20833 11.4H7.78125L8.42448 24.475C8.46615 25.3275 9.20052 26 10.0885 26H21.9115C22.8021 26 23.5339 25.33 23.5755 24.475L24.2187 11.4H25.7917C25.9062 11.4 26 11.31 26 11.2V10.4C26 9.9575 25.6276 9.6 25.1667 9.6ZM21.7109 24.2H10.2891L9.65885 11.4H22.3411L21.7109 24.2Z" />
                            </svg>
                        </button>
                    </div>
                )}

                        <div className="h-12 left-[70px] top-[129.71px] absolute flex-col justify-start items-start gap-2.5 inline-flex">
                            <div className="self-stretch justify-start items-center gap-2 inline-flex">
                                <div data-svg-wrapper className="relative">
                                    <a href={`/product/${id}`}>
                                    <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.07191 15.9215L22.1594 4.91836C22.1962 4.88938 22.2404 4.87137 22.287 4.8664C22.3336 4.86143 22.3806 4.86969 22.4227 4.89025C22.4648 4.91081 22.5003 4.94283 22.525 4.98263C22.5497 5.02242 22.5627 5.06838 22.5625 5.11523V7.53086C22.5625 7.68398 22.4906 7.83086 22.3719 7.92461L11.1219 16.709L22.3719 25.4934C22.4937 25.5871 22.5625 25.734 22.5625 25.8871V28.3027C22.5625 28.5121 22.3219 28.6277 22.1594 28.4996L8.07191 17.4965C7.95218 17.4031 7.85532 17.2836 7.78869 17.1472C7.72207 17.0107 7.68744 16.8608 7.68744 16.709C7.68744 16.5571 7.72207 16.4073 7.78869 16.2708C7.85532 16.1344 7.95218 16.0149 8.07191 15.9215Z" fill="#E6DFE7" />
                                    </svg>
                                    </a>
                                </div>
                                <div className="text-[#e6dfe7] text-3xl font-medium font-['Skema Pro Omni'] leading-[38px]">Редагувати</div>
                            </div>
                            <div data-svg-wrapper>
                                <svg width="1300" height="2" viewBox="0 0 1300 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 0.708984L1300 0.709098" stroke="#E6DFE7" />
                                </svg>
                            </div>
                        </div>

                

                {/* Додаткові зображення */}
                <div className="left-[110px] top-[563px] absolute text-white text-base">Додаткові зображення</div>
                <label className="h-[146px] p-4 left-[110px] top-[599px] absolute bg-[#efc2ff]/20 rounded-lg border border-[#e6dfe7] flex-col justify-start items-center gap-4 inline-flex cursor-pointer">
                    <input type="file" className="hidden" multiple onChange={handleAdditionalFiles} accept="image/*" />
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M41.4929 20.9197L41.4836 20.8822L36.2242 7.51816C35.9898 6.76348 35.2914 6.24316 34.4992 6.24316H13.1804C12.3836 6.24316 11.6757 6.77285 11.4507 7.53691L6.53355 20.765L6.51949 20.7979L6.51012 20.8354C6.44918 21.065 6.43043 21.2994 6.46324 21.5291C6.45855 21.6041 6.45387 21.6791 6.45387 21.7541V38.9057C6.45511 39.6611 6.75577 40.3853 7.28998 40.9195C7.82419 41.4538 8.54838 41.7544 9.30387 41.7557H38.7039C40.2742 41.7557 41.5539 40.476 41.5586 38.9057V21.7541C41.5586 21.6932 41.5586 21.6322 41.5539 21.5807C41.5726 21.351 41.5539 21.1307 41.4929 20.9197ZM27.6273 18.9041L27.6132 19.64C27.5757 21.7447 26.1226 23.1604 23.9992 23.1604C22.9632 23.1604 22.0726 22.8275 21.4304 22.1947C20.7882 21.5619 20.4367 20.6807 20.4179 19.64L20.4039 18.9041H10.757L14.4836 9.84316H33.1961L37.0257 18.9041H27.6273ZM10.0492 22.5041H17.4226C18.5617 25.1807 20.9851 26.7604 24.0039 26.7604C25.5836 26.7604 27.0507 26.3197 28.2367 25.4853C29.2773 24.7541 30.0882 23.7322 30.6132 22.5041H37.9492V38.1557H10.0492V22.5041Z" fill="#FF7086" />
                    </svg>
                    <div className="text-center">
                        <div className="text-[#e6dfe7] text-base">Click or drag files to upload</div>
                        <div className="text-[#bc98c8] text-sm">Max 5 files (JPEG, PNG, GIF)</div>
                    </div>
                </label>

                {/* Прев'ю додаткових зображень */}
                {additionalImages.length > 0 && (
                    <div className="left-[110px] top-[750px] absolute flex gap-4 flex-wrap">
                        {additionalImages.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    className="w-24 h-24 object-cover rounded-lg"
                                    src={img}
                                    alt={`Additional ${index + 1}`}
                                />
                                <button
                                    onClick={() => deleteImage(index)}
                                    className="absolute -top-2 -right-2 bg-[#BC98C9] rounded-full p-1 hover:bg-[#a87db3] transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#410C55">
                                        <path d="M12.8536 3.14645C13.0488 3.34171 13.0488 3.65829 12.8536 3.85355L9.20711 8.5L12.8536 13.1464C13.0488 13.3417 13.0488 13.6583 12.8536 13.8536C12.6583 14.0488 12.3417 14.0488 12.1464 13.8536L8.5 9.20711L4.85355 13.8536C4.65829 14.0488 4.34171 14.0488 4.14645 13.8536C3.95118 13.6583 3.95118 13.3417 4.14645 3.85355L7.79289 8.5L4.14645 3.14645C3.95118 2.95118 4.34171 2.95118 4.14645 3.14645C4.34171 3.34171 4.65829 3.34171 4.14645 3.14645L8.5 6.79289L12.1464 3.14645C12.3417 2.95118 12.6583 2.95118 12.8536 3.14645Z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Права частина форми */}
                <div className="left-[730px] top-[258px] absolute flex flex-col gap-6">
                    {/* Назва роботи */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-[#e6dfe7] text-sm">Назва роботи</span>
                            <span className="text-[#cc0000]">*</span>
                        </div>
                        <div className="w-[360px] rounded-md border border-[#bc98c8] relative">
                            <input
                                className="w-full bg-transparent px-4 py-2 text-[#e6dfe7] text-sm placeholder-[#bc98c8] focus:outline-none"
                                placeholder="Ваша назва..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={30}
                            />
                            <div className="absolute right-4 top-2.5 text-[#bc98c8] text-[11px]">
                                {title.length}/30
                            </div>
                        </div>
                    </div>

                    {/* Опис */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-[#e6dfe7] text-sm">Опис</span>
                            <span className="text-[#cc0000]">*</span>
                        </div>
                        <div className="w-[360px] h-20 rounded-md border border-[#bc98c8] relative">
                            <textarea
                                className="w-full h-full bg-transparent px-4 py-2 text-[#e6dfe7] text-sm resize-none focus:outline-none"
                                placeholder="Ваш опис..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={1000}
                            />
                            <div className="absolute right-4 bottom-2 text-[#bc98c8] text-[11px]">
                                {description.length}/1000
                            </div>
                        </div>
                    </div>

                    {/* Категорія */}
                    <div className="flex flex-col gap-1 relative">
                        <div className="text-[#e6dfe7] text-sm">Категорія</div>
                        <div
                            className="w-[360px] px-4 py-2 rounded-md border border-[#bc98c8] bg-transparent cursor-pointer"
                            onClick={() => toggleDropdown('category')}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[#e6dfe7] text-sm">
                                    {selectedCategory || 'Оберіть категорію'}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className={`transform transition-transform ${dropdownOpen.category ? 'rotate-180' : ''}`}
                                >
                                    <path d="M13.8127 4H12.6408C12.5611 4 12.4861 4.03906 12.4393 4.10313L8.0002 10.2219L3.56114 4.10313C3.51426 4.03906 3.43926 4 3.35957 4H2.1877C2.08614 4 2.02676 4.11563 2.08614 4.19844L7.59551 11.7937C7.79551 12.0687 8.20489 12.0687 8.40332 11.7937L13.9127 4.19844C13.9736 4.11563 13.9143 4 13.8127 4Z" fill="#BC98C9" />
                                </svg>
                            </div>
                        </div>
                        {dropdownOpen.category && (
                            <div className="absolute top-full w-[360px] mt-1 bg-[#080217] border border-[#bc98c8] rounded-md z-10">
                                {categories.map(category => (
                                    <div
                                        key={category}
                                        className="px-4 py-2 hover:bg-[#ff7086]/20 cursor-pointer"
                                        onClick={() => handleSelect(category, 'category')}
                                    >
                                        <span className="text-[#e6dfe7] text-sm">{category}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ціна */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-[#e6dfe7] text-sm">Ціна</span>
                            <span className="text-[#cc0000]">*</span>
                        </div>
                        <div className="w-full rounded-md border border-[#bc98c8] relative">
                            <input
                                type="number"
                                className="w-full bg-transparent px-4 py-2 text-[#e6dfe7] text-sm focus:outline-none"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <span className="absolute right-4 top-2.5 text-[#bc98c8] text-[11px]">UAH</span>
                        </div>
                    </div>

                    {/* Розмір */}
                    <div className="flex flex-col gap-2">
                        <div className="text-[#e6dfe7] text-sm">Розмір</div>
                        <div className="flex flex-wrap gap-4">
                            {['маленький', 'середній', 'великий', 'габаритний'].map((size) => (
                                <label key={size} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedSizes.includes(size)}
                                        onChange={() => setSelectedSizes(prev =>
                                            prev.includes(size)
                                                ? prev.filter(s => s !== size)
                                                : [...prev, size]
                                        )}
                                    />
                                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center 
                                            ${selectedSizes.includes(size) ? 'bg-[#ff7086] border-[#ff7086]' : 'border-[#bc98c8]'}`}>
                                        {selectedSizes.includes(size) && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                                                <path d="M10.28 2.28L4 8.56L1.72 6.28a1 1 0 00-1.41 1.41l3 3a1 1 0 001.41 0l7-7a1 1 0 00-1.41-1.41z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[#e6dfe7] text-sm">{size}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Формат */}
                    <div className="flex flex-col gap-2">
                        <div className="text-[#e6dfe7] text-sm">Формат</div>
                        <div className="flex gap-4">
                            {['Горизонтальна', 'Вертикальна'].map((format) => (
                                <label key={format} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="format"
                                        className="hidden"
                                        checked={selectedFormats.includes(format)}
                                        onChange={() => setSelectedFormats([format])}
                                    />
                                    <div className={`w-4 h-4 border rounded-full flex items-center justify-center 
                                            ${selectedFormats.includes(format) ? 'border-[#ff7086]' : 'border-[#bc98c8]'}`}>
                                        {selectedFormats.includes(format) && (
                                            <div className="w-2 h-2 rounded-full bg-[#ff7086]" />
                                        )}
                                    </div>
                                    <span className="text-[#e6dfe7] text-sm">{format}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Техніка */}
                    <div className="flex flex-col gap-1 relative">
                        <div className="text-[#e6dfe7] text-sm">Техніка</div>
                        <div
                            className="w-[360px] px-4 py-2 rounded-md border border-[#bc98c8] bg-transparent cursor-pointer"
                            onClick={() => toggleDropdown('technique')}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[#e6dfe7] text-sm">
                                    {selectedTechnique || 'Оберіть техніку'}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className={`transform transition-transform ${dropdownOpen.technique ? 'rotate-180' : ''}`}
                                >
                                    <path d="M13.8127 4H12.6408C12.5611 4 12.4861 4.03906 12.4393 4.10313L8.0002 10.2219L3.56114 4.10313C3.51426 4.03906 3.43926 4 3.35957 4H2.1877C2.08614 4 2.02676 4.11563 2.08614 4.19844L7.59551 11.7937C7.79551 12.0687 8.20489 12.0687 8.40332 11.7937L13.9127 4.19844C13.9736 4.11563 13.9143 4 13.8127 4Z" fill="#BC98C9" />
                                </svg>
                            </div>
                        </div>
                        {dropdownOpen.technique && (
                            <div className="absolute top-full w-[360px] mt-1 bg-[#080217] border border-[#bc98c8] rounded-md z-10">
                                {techniques.map(technique => (
                                    <div
                                        key={technique}
                                        className="px-4 py-2 hover:bg-[#ff7086]/20 cursor-pointer"
                                        onClick={() => handleSelect(technique, 'technique')}
                                    >
                                        <span className="text-[#e6dfe7] text-sm">{technique}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Художній напрямок */}
                    <div className="flex flex-col gap-1 relative">
                        <div className="text-[#e6dfe7] text-sm">Художній напрямок</div>
                        <div
                            className="w-[360px] px-4 py-2 rounded-md border border-[#bc98c8] bg-transparent cursor-pointer"
                            onClick={() => toggleDropdown('artDirection')}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[#e6dfe7] text-sm">
                                    {selectedArtDirection || 'Оберіть напрямок'}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className={`transform transition-transform ${dropdownOpen.artDirection ? 'rotate-180' : ''}`}
                                >                                    <path d="M13.8127 4H12.6408C12.5611 4 12.4861 4.03906 12.4393 4.10313L8.0002 10.2219L3.56114 4.10313C3.51426 4.03906 3.43926 4 3.35957 4H2.1877C2.08614 4 2.02676 4.11563 2.08614 4.19844L7.59551 11.7937C7.79551 12.0687 8.20489 12.0687 8.40332 11.7937L13.9127 4.19844C13.9736 4.11563 13.9143 4 13.8127 4Z" fill="#BC98C9" />
                                </svg>
                            </div>
                        </div>
                        {dropdownOpen.artDirection && (
                            <div className="absolute top-full w-[360px] mt-1 bg-[#080217] border border-[#bc98c8] rounded-md z-10">
                                {artDirections.map(direction => (
                                    <div
                                        key={direction}
                                        className="px-4 py-2 hover:bg-[#ff7086]/20 cursor-pointer"
                                        onClick={() => handleSelect(direction, 'artDirection')}
                                    >
                                        <span className="text-[#e6dfe7] text-sm">{direction}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Кольори */}
                    <div className="flex flex-col gap-2">
                        <div className="text-[#e6dfe7] text-sm">Використані кольори</div>
                        <div className="grid grid-cols-2 gap-2">
                            {colors.map((color) => (
                                <label key={color.name} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedColors.includes(color.name)}
                                        onChange={() => setSelectedColors(prev =>
                                            prev.includes(color.name)
                                                ? prev.filter(c => c !== color.name)
                                                : [...prev, color.name]
                                        )}
                                    />
                                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center 
                                            ${selectedColors.includes(color.name) ? 'bg-[#ff7086] border-[#ff7086]' : 'border-[#bc98c8]'}`}>
                                        {selectedColors.includes(color.name) && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                                                <path d="M10.28 2.28L4 8.56L1.72 6.28a1 1 0 00-1.41 1.41l3 3a1 1 0 001.41 0l7-7a1 1 0 00-1.41-1.41z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[#e6dfe7] text-sm">{color.name}</span>
                                    <div
                                        className="w-4 h-4 rounded border border-[#bc98c8]"
                                        style={{ backgroundColor: color.code }}
                                    ></div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Рік створення */}
                    <div className="flex flex-col gap-1">
                        <div className="text-[#e6dfe7] text-sm">Рік створення</div>
                        <input
                            className="w-[360px] px-4 py-2 rounded-md border border-[#bc98c8] bg-transparent text-[#e6dfe7] focus:outline-none"
                            placeholder="Рік..."
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        />
                    </div>

                    {/* Кнопка оновлення */}
                    <button
                        className="mt-4 px-6 py-2 bg-[#ff7086] rounded border border-[#e6dfe7] hover:bg-[#ff5c75] transition-colors"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Завантаження...' : 'Оновити роботу'}
                    </button>

                    {/* Повідомлення про помилку */}
                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Модальне вікно */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-[#080217] p-6 rounded-lg border border-[#e6dfe7] min-w-[300px] text-center">
                        <div className={`text-xl mb-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                            {isSuccess ? 'Успіх!' : 'Помилка'}
                        </div>
                        <div className="text-[#e6dfe7] mb-6">{modalMessage}</div>
                        <button
                            className="w-full py-2 bg-[#ff7086] rounded hover:bg-[#ff5c75] transition-colors"
                            onClick={handleModalClose}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Update;