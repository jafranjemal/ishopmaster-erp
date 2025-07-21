import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import { tenantHrService } from '../../services/api'; // Assuming you have an HR service

const TechnicianSelector = ({ onSelect, currentTechnicianId }) => {
  const [technicians, setTechnicians] = useState([]);
  useEffect(() => {
    // In a real app, you'd filter by Job Position on the backend
    tenantHrService.getAllEmployees().then((res) => {
      // console.log('res ', res.data.data);
      setTechnicians(
        res.data.data.employees.filter((emp) => emp.designation?.title.toLowerCase().includes('technician')),
      );
    });
  }, [currentTechnicianId]);

  return (
    <>
      <Select onValueChange={onSelect} value={currentTechnicianId}>
        <SelectTrigger>
          <SelectValue placeholder='Unassigned' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>Unassigned</SelectItem>
          {technicians.map((tech) => (
            <SelectItem key={tech._id} value={tech._id}>
              {tech.name} ({tech?.designation?.title})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};
export default TechnicianSelector;
