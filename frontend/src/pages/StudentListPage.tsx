import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter } from 'lucide-react';
import { api } from '@/services/api';

interface Student {
  _id: string;
  matricNo: string;
  firstName: string;
  lastName: string;
  programme: { name: string };
  currentLevel: number;
  status: string;
}

export function StudentListPage() {
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState({});

  const { data, isLoading, error } = useQuery<
    {
      data: Student[];
      meta: { total: number; page: number; limit: number };
    },
    AxiosError
  >({
    queryKey: ['students', page, filters],
    queryFn: () =>
      api
        .get('/api/students', {
          params: { page, limit: 20, ...filters },
        })
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const columns = [
    { header: 'Matric Number', accessorKey: 'matricNo' },
    { header: 'Name', accessorKey: 'firstName', cell: (row: any) => `${row.firstName} ${row.lastName}` },
    { header: 'Programme', accessorKey: 'programme.name' },
    { header: 'Level', accessorKey: 'currentLevel' },
    { header: 'Status', accessorKey: 'status', cell: (row: any) => <span className="badge">{row.status}</span> },
    {
      header: 'Actions',
      cell: (row: any) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/students/${row._id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Students</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.data || []}
            loading={isLoading}
            error={error?.message}
            pagination={{
              page,
              total: data?.meta.total || 0,
              limit: 20,
              onPageChange: setPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentListPage;
