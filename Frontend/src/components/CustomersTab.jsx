import { useEffect, useState } from 'react';
import { Collapse, Spin, Alert, Button } from 'antd';

const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = JSON.parse(localStorage.getItem('kasha'))?.token;

  console.log('storedData', token);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/customers/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.status === 401) {
          localStorage.removeItem('kasha');
          window.location.href = '/'; // redirect to login
          return;
        }

        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        setCustomers(data.customers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalVisible(true);
  };

  if (loading) return <Spin tip="Loading customers..." />;
  if (error) return <Alert type="error" message={error} showIcon />;

  return (
    <>
      <Collapse accordion>
        {customers.map((cust) => (
          <Collapse.Panel header={cust.unique_identifier} key={cust.id}>
            <p>
              <strong>Phone:</strong> {cust.primary_phone}
            </p>
            <p>
              <strong>Sex:</strong> {cust.sex}
            </p>
            <p>
              <strong>Age:</strong> {cust.age}
            </p>
            <p>
              <strong>Sub-county:</strong> {cust.sub_county}
            </p>
            <p>
              <strong>Alternate Phone:</strong> {cust.alternate_phone}
            </p>
            <p>
              <strong>Client Type:</strong> {cust.client_type}
            </p>
            {/* Add more fields as needed */}
          </Collapse.Panel>
        ))}
      </Collapse>
    </>
  );
};

export default CustomersTab;
