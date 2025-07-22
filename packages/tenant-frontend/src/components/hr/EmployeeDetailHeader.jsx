import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui-library';

const EmployeeDetailHeader = ({ employee }) => (
  <Card>
    <CardHeader>
      <div className='flex justify-between items-start'>
        <div>
          <CardTitle className='text-2xl'>{employee.name}</CardTitle>
          <CardDescription>
            {employee.jobPositionId} at {employee.branchId?.name}
          </CardDescription>
        </div>
        <Badge variant={employee.isActive ? 'success' : 'destructive'}>
          {employee.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className='text-sm text-slate-400'>
      <p>Email: {employee.contactInfo?.email || 'N/A'}</p>
      <p>Phone: {employee.contactInfo?.phone || 'N/A'}</p>
    </CardContent>
  </Card>
);
export default EmployeeDetailHeader;
