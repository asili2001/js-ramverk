import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/documents')}>Go To Your Documents</button>
  );
};

export default Home;
