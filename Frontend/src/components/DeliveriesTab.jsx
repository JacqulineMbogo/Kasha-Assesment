import { useEffect, useState } from 'react';
import {
  Collapse,
  Spin,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Descriptions,
  Tag,
} from 'antd';
const { Option } = Select;

const DeliveriesTab = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form] = Form.useForm();
  const token = JSON.parse(localStorage.getItem('kasha'))?.token;
  const staff_id = JSON.parse(localStorage.getItem('kasha'))?.userId;

  useEffect(() => {
    fetchDeliveries();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/deliveries/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 401) {
        localStorage.removeItem('kasha');
        window.location.href = '/';
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch deliveries');
      const data = await res.json();
      setDeliveries(data.deliveries);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/customers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data.customers);
    } catch (err) {
      message.error(err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleAddDelivery = async (values) => {
    console.log('Submitted form values:', values);

    const formatted = {
      ...values,
      staff_id,
      last_vl_date: values.last_vl_date?.format('YYYY-MM-DD'),
      tca_date: values.tca_date?.format('YYYY-MM-DD'),
      preferred_date: values.preferred_date?.format('YYYY-MM-DD'),
    };

    try {
      await apiFetch('/deliveries', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formatted,
        }),
      });
      console.log('body', formatted);
      if (res.status === 401) {
        localStorage.removeItem('kasha');
        window.location.href = '/';
        return;
      }
      if (!res.ok) throw new Error('Failed to add delivery');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDeliveries((prev) => [...prev, data.delivery]);
      form.resetFields();
      setIsModalVisible(false);
      setLoading(true);
      setError(null);

      message.success('Delivery added successfully');
      fetchDeliveries();
    } catch (err) {
      message.error(err.message);
    }
  };

  if (loading) return <Spin tip="Loading deliveries..." />;
  if (error) return <Alert type="error" message={error} showIcon />;

  return (
    <>
      <Button
        type="primary"
        className="mb-4"
        onClick={() => setIsModalVisible(true)}
      >
        Add Delivery
      </Button>

      <Collapse accordion>
        {deliveries.map((d) => {
          const header = `${d.customer_id?.unique_identifier || 'Unknown'} - ${
            d.facility_name
          } - ${d.status}`;
          const statusColor =
            d.status === 'delivered'
              ? 'green'
              : d.status === 'pending'
              ? 'orange'
              : 'red';

          return (
            <Collapse.Panel
              header={
                <>
                  <strong>{header}</strong>
                  <Tag color={statusColor} style={{ marginLeft: 10 }}>
                    {d.status.toUpperCase()}
                  </Tag>
                </>
              }
              key={d.id}
            >
              <Descriptions
                title="Customer Info"
                size="small"
                column={1}
                bordered
              >
                <Descriptions.Item label="Unique ID">
                  {d.customer_id?.unique_identifier}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {d.customer_id?.primary_phone}
                </Descriptions.Item>
                <Descriptions.Item label="Sex">
                  {d.customer_id?.sex}
                </Descriptions.Item>
                <Descriptions.Item label="Age">
                  {d.customer_id?.age}
                </Descriptions.Item>
                <Descriptions.Item label="Sub County">
                  {d.customer_id?.sub_county}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title="Product Info"
                size="small"
                column={1}
                bordered
                className="mt-4"
              >
                <Descriptions.Item label="Product">
                  {d.product_id?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {d.product_id?.description}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title="Delivery Info"
                size="small"
                column={1}
                bordered
                className="mt-4"
              >
                <Descriptions.Item label="Facility">
                  {d.facility_name}
                </Descriptions.Item>
                <Descriptions.Item label="Preferred Location">
                  {d.preferred_location}
                </Descriptions.Item>
                <Descriptions.Item label="Actual Location">
                  {d.actual_location || 'Not yet delivered'}
                </Descriptions.Item>
                <Descriptions.Item label="Preferred Date">
                  {d.preferred_date?.split('T')[0]}
                </Descriptions.Item>
                <Descriptions.Item label="Actual Date">
                  {d.actual_date?.split('T')[0] || 'Pending'}
                </Descriptions.Item>
                <Descriptions.Item label="VL Date">
                  {d.last_vl_date?.split('T')[0]}
                </Descriptions.Item>
                <Descriptions.Item label="TCA Date">
                  {d.tca_date?.split('T')[0]}
                </Descriptions.Item>
                <Descriptions.Item label="Returned?">
                  {d.meds_returned ? 'Yes' : 'No'}
                </Descriptions.Item>
                <Descriptions.Item label="Signed by Client?">
                  {d.signed_by_client ? 'Yes' : 'No'}
                </Descriptions.Item>
                <Descriptions.Item label="Comments">
                  {d.comments || '—'}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title="Handled By"
                size="small"
                column={1}
                bordered
                className="mt-4"
              >
                <Descriptions.Item label="Staff / Rider">
                  {d.staff_id?.username || 'Unknown'}
                </Descriptions.Item>
              </Descriptions>
            </Collapse.Panel>
          );
        })}
      </Collapse>

      <Modal
        title="Add Delivery"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleAddDelivery}>
          <Form.Item
            name="customer_id"
            label="Customer"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select customer">
              {customers.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.unique_identifier}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="product_id"
            label="Product"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select product">
              {products.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="facility_name"
            label="Facility"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Form.Item>
          <Form.Item name="last_vl_date" label="Last VL Date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="tca_date" label="TCA Date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="preferred_date" label="Preferred Delivery Date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="preferred_location" label="Preferred Location">
            <Input />
          </Form.Item>
          <Form.Item name="comments" label="Comments">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DeliveriesTab;
