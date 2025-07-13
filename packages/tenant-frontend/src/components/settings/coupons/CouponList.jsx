import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from 'ui-library';
import useAuth from '../../../context/useAuth';

const CouponList = ({ coupons }) => {
  const { formatDate } = useAuth();
  const statusColors = { active: 'success', redeemed: 'secondary', expired: 'destructive' };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unique Code</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Redeemed On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((c) => (
          <TableRow key={c._id}>
            <TableCell className='font-mono'>{c.code}</TableCell>
            <TableCell>
              <Badge variant={statusColors[c.status]} className='capitalize'>
                {c.status}
              </Badge>
            </TableCell>
            <TableCell>{c.redeemedAt ? formatDate(c.redeemedAt) : '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default CouponList;
