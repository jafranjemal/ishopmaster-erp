import { FilePenLine, Trash2 } from 'lucide-react';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';

const HardwareDeviceList = ({ devices, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Device Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Branch</TableHead>
        <TableHead>Connection</TableHead>
        <TableHead className='text-right'>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {devices.map((device) => (
        <TableRow key={device._id}>
          <TableCell className='font-medium'>
            {device.name} {device.isDefault && <Badge>Default</Badge>}
          </TableCell>
          <TableCell>
            <Badge variant='outline' className='capitalize'>
              {device.type.replace('_', ' ')}
            </Badge>
          </TableCell>
          <TableCell>{device.branchId?.name || 'N/A'}</TableCell>
          <TableCell className='capitalize'>{device.connectionType}</TableCell>
          <TableCell className='text-right space-x-1'>
            <Button variant='ghost' size='icon' onClick={() => onEdit(device)}>
              <FilePenLine className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' onClick={() => onDelete(device)}>
              <Trash2 className='h-4 w-4 text-red-500' />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
export default HardwareDeviceList;
