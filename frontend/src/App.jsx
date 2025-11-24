import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import TeamLogin from './Components/TeamLogin';
import SalesTeamDashboard from './Components/SalesTeamDashboard';
import ProductionTeam from './Components/ProductionTeam';
import ProtectedRoute from './Components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route  path='/spteamlogin'  element={
          <ProtectedRoute allowedRoles={["team"]}>
            <TeamLogin />
          </ProtectedRoute>
        }/> */}

       
        <Route  path='/spteamlogin'  element={<TeamLogin />}/>
      <Route  path='/salesteamdashboard' element={
        <ProtectedRoute allowedRoles={["salesteam"]}>
          <SalesTeamDashboard/>
        </ProtectedRoute>
      }/>
      <Route  path='/productiondashboard' element={
        <ProtectedRoute allowedRoles={["productionteam"]}>
          <ProductionTeam/>
        </ProtectedRoute>
      }/>
      {/* Add more routes here when needed */}
    </Routes>
  );
};

export default App;
