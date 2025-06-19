import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import TeamLogin from './Components/TeamLogin';
import SalesTeamDashboard from './Components/SalesTeamDashboard';
import AdmiDashboard from './Components/AdmiDashboard';
import ProductionTeam from './Components/ProductionTeam';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route  path='/spteamlogin' element={<TeamLogin/>}/>
      <Route path='/admindashboard' element={<AdmiDashboard/>}/>
      <Route  path='/salesteamdashboard' element={<SalesTeamDashboard/>}/>
      <Route  path='/productiondashboard' element={<ProductionTeam/>}/>
      {/* Add more routes here when needed */}
    </Routes>
  );
};

export default App;
