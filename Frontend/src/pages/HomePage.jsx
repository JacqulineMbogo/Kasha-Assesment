import { Tabs } from 'antd';
import CustomersTab from '../components/CustomersTab';
import DeliveriesTab from '../components/DeliveriesTab';

const HomePage = () => {
  const items = [
    { key: '1', label: 'Dashboard', children: <p>Coming soon...</p> },
    { key: '2', label: 'Customers', children: <CustomersTab /> },
    { key: '3', label: 'Deliveries', children: <DeliveriesTab /> },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default HomePage;
