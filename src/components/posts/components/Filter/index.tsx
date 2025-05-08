import React, { useState } from "react";
import { Form, Select, Collapse, Checkbox, Input, Button } from "antd";
import Slider from "@mui/material/Slider";
import "./index.css";

const { Panel } = Collapse;

type FilterValues = {
  category?: string;
  sortBy?: string;
  price?: [number, number];
  size?: string;
  format?: string;
  technique?: string;
  artStyle?: string;
  color?: string;
};

interface Props {
  onFilter: (values: FilterValues) => void;
}

const ProductFilter: React.FC<Props> = ({ onFilter }) => {
  const [form] = Form.useForm();
  const [priceRange, setPriceRange] = useState<number[]>([0, 500000]);

  const applyFilters = () => {
    const values = form.getFieldsValue(true);
    const formattedValues: Record<string, string | number | string[]> = {};

    if (values.category) formattedValues.category = values.category;
    if (values.sortBy) formattedValues.sortBy = values.sortBy;

    if (values.price) {
      formattedValues.priceFrom = values.price[0];
      formattedValues.priceTo = values.price[1];
    }
    if (values.size) formattedValues.sizes = values.size;
    if (values.format) formattedValues.formats = values.format;
    if (values.technique) formattedValues.techniques = values.technique;
    if (values.artStyle) formattedValues.artisticDirections = values.artStyle;
    if (values.color) formattedValues.colors = values.color;

    console.log("Formatted filters:", formattedValues);
    onFilter(formattedValues);
  };

  const resetFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
    form.resetFields();
    setPriceRange([0, 500000]);
    onFilter({});
    console.log("Filters reset");
    // Знімаємо фокус із кнопки після натискання
    e.currentTarget.blur();
  };

  const handlePriceChange = (_event: React.ChangeEvent<HTMLInputElement> | Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
    form.setFieldsValue({ price: newValue });
    applyFilters();
  };

  return (
    <div className="filter-container">
      <Form
        form={form}
        layout="vertical"
        onValuesChange={applyFilters}
      >
        <Collapse
          bordered={false}
          defaultActiveKey={["1", "2", "3", "4"]}
          expandIconPosition="end"
          className="custom-collapse"
        >
          <Panel header={null} key="1" showArrow={false} collapsible="disabled">
            <Form.Item name="category">
              <div className="select-inline">
                <label className="select-label">Категорії:</label>
                <Select
                  placeholder="Оберіть категорію"
                  className="form-control"
                  onChange={(value) => {
                    console.log("Selected category:", value);
                    form.setFieldsValue({ category: value });
                    applyFilters();
                  }}
                >
                  <Select.Option value="картини">Картини</Select.Option>
                  <Select.Option value="графіка">Графіка</Select.Option>
                  <Select.Option value="скульптура">Скульптура</Select.Option>
                  <Select.Option value="фотографія">Фотографія</Select.Option>
                  <Select.Option value="цифрове мистецтво">Цифрове мистецтво</Select.Option>
                  <Select.Option value="інше">Інше...</Select.Option>
                </Select>
              </div>
            </Form.Item>
          </Panel>
          <Panel header={null} key="2" showArrow={false} collapsible="disabled">
            <Form.Item name="sortBy" initialValue="ціна (за зростанням)">
              <div className="select-inline">
                <label className="select-label">Сортувати за:</label>
                <Select
                  placeholder="Оберіть параметр"
                  className="form-control"
                  onChange={(value) => {
                    console.log("Selected sortBy:", value);
                    form.setFieldsValue({ sortBy: value });
                    applyFilters();
                  }}
                >
                  <Select.Option value="ціна (за зростанням)">Ціна (від низької до високої)</Select.Option>
                  <Select.Option value="ціна (за спаданням)">Ціна (від високої до низької)</Select.Option>
                  <Select.Option value="дата (за зростанням)">Дата (за зростанням)</Select.Option>
                  <Select.Option value="дата (за спаданням)">Дата (за спаданням)</Select.Option>
                </Select>
              </div>
            </Form.Item>
          </Panel>
          <Panel header="Ціна:" key="3" showArrow={false} collapsible="disabled">
            <Form.Item name="price">
              <Slider
                getAriaLabel={() => "Price range"}
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                getAriaValueText={(value) => `${value} UAH`}
                min={0}
                max={50000}
                defaultValue={[0, 50000]}
                aria-label="Price"
                color="secondary"
                sx={{
                  "& .MuiSlider-thumb": {
                    backgroundColor: "white",
                  },
                  "& .MuiSlider-thumb:hover": {
                    boxShadow: "0 0 0 8px rgba(25, 118, 210, 0.16)",
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "rgb(188, 152, 201)",
                  },
                }}
              />
            </Form.Item>
            <Form.Item>
              <div className="price-inputs">
                <div className="price-labels">
                  <div className="price-box">
                    <p className="MM">Min | </p>
                    <div className="price-values">
                      <Input
                        type="number"
                        placeholder="Min"
                        style={{ width: "70px" }}
                        className="form-control price-input"
                        value={priceRange[0]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePriceChange(e, [Number(e.target.value), priceRange[1]])
                        }
                      />
                    </div>
                  </div>
                  <div className="price-box">
                    <p className="MM">Max | </p>
                    <div className="price-values">
                      <Input
                        type="number"
                        style={{ width: "70px" }}
                        placeholder="Max"
                        className="form-control price-input"
                        value={priceRange[1]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePriceChange(e, [priceRange[0], Number(e.target.value)])
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Form.Item>
          </Panel>
          <Panel header="Розмір:" key="4" showArrow={false} collapsible="disabled">
            <Form.Item name="size">
              <Checkbox.Group>
                <div className="checkbox-column">
                  <Checkbox value="маленький">Маленька</Checkbox>
                  <Checkbox value="середній">Середня</Checkbox>
                  <Checkbox value="великий">Велика</Checkbox>
                  <Checkbox value="габаритний">Габаритна</Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>
          </Panel>
        </Collapse>
        <Collapse
          accordion
          bordered={false}
          expandIconPosition="end"
          className="custom-collapse"
          defaultActiveKey="5"
        >
          <Panel header="Формат" key="5">
            <Form.Item name="format">
              <Checkbox.Group>
                <div className="checkbox-column">
                  <Checkbox value="Горизонтальна">Горизонтальна</Checkbox>
                  <Checkbox value="Вертикальна">Вертикальна</Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>
          </Panel>
          <Panel header="Техніка" key="6">
            <Form.Item name="technique">
              <Checkbox.Group>
                <div className="checkbox-column">
                  <Checkbox value="олійні фарби">Олійні фарби</Checkbox>
                  <Checkbox value="акрил">Акрил</Checkbox>
                  <Checkbox value="акварель">Акварель</Checkbox>
                  <Checkbox value="авторська">Авторська</Checkbox>
                  <Checkbox value="аерозольна фарба">Аерозольна фарба</Checkbox>
                  <Checkbox value="гуаш">Гуаш</Checkbox>
                  <Checkbox value="олівець">Олівець</Checkbox>
                  <Checkbox value="колаж">Колаж</Checkbox>
                  <Checkbox value="маркер і фломастер">Маркер і фломастер</Checkbox>
                  <Checkbox value="офорт">Офорт</Checkbox>
                  <Checkbox value="монотипія">Монотипія</Checkbox>
                  <Checkbox value="пастель">Пастель</Checkbox>
                  <Checkbox value="левкас">Левкас</Checkbox>
                  <Checkbox value="ручка">Ручка</Checkbox>
                  <Checkbox value="темпера">Темпера</Checkbox>
                  <Checkbox value="туш">Туш</Checkbox>
                  <Checkbox value="емаль">Емаль</Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>
          </Panel>
          <Panel header="Художній напрямок" key="7">
            <Form.Item name="artStyle">
              <Checkbox.Group>
                <div className="checkbox-column">
                  <Checkbox value="абстракціонізм">Абстракціонізм</Checkbox>
                  <Checkbox value="Імпресіонізм">Імпресіонізм</Checkbox>
                  <Checkbox value="кубізм">Кубізм</Checkbox>
                  <Checkbox value="поп-арт">Поп-арт</Checkbox>
                  <Checkbox value="реалізм">Реалізм</Checkbox>
                  <Checkbox value="символізм">Символізм</Checkbox>
                  <Checkbox value="мінімалізм">Мінімалізм</Checkbox>
                  <Checkbox value="модернізм">Модернізм</Checkbox>
                  <Checkbox value="примітивізм">Примітивізм</Checkbox>
                  <Checkbox value="інше">Інше...</Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>
          </Panel>
          <Panel header="Колір" key="8">
            <Form.Item name="color">
              <Checkbox.Group>
                <div className="checkbox-column">
                  <Checkbox value="червоний">Червоний</Checkbox>
                  <Checkbox value="оранжевий">Оранжевий</Checkbox>
                  <Checkbox value="жовтий">Жовтий</Checkbox>
                  <Checkbox value="зелений">Зелений</Checkbox>
                  <Checkbox value="блакитний">Блакитний</Checkbox>
                  <Checkbox value="синій">Синій</Checkbox>
                  <Checkbox value="фіолетовий">Фіолетовий</Checkbox>
                  <Checkbox value="рожевий">Рожевий</Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>
          </Panel>
        </Collapse>
      </Form>
      <div className="reset-button-container">
        <Button
          className="reset-filter-button"
          onClick={resetFilters}
        >
          Очистити фільтр
        </Button>
      </div>
    </div>
  );
};

export default ProductFilter;