import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../../components/Layout/AdminLayout';
import useNotification from '../../../hooks/useNotification';
import api from '../../../utils/api';

export default function NewsAdminPage() {
  const { showError, showSuccess } = useNotification();
  const queryClient = useQueryClient();

  const { data: news = [], isLoading } = useQuery(['news', 'admin'], () =>
    api.get('/news/admin').then((res) => res.data)
  );

  const createMutation = useMutation(
    (data) => api.post('/news', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['news']);
        showSuccess('News created successfully');
      },
      onError: (error) => {
        showError(error.message);
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/news/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['news']);
        showSuccess('News updated successfully');
      },
      onError: (error) => {
        showError(error.message);
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/news/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['news']);
        showSuccess('News deleted successfully');
      },
      onError: (error) => {
        showError(error.message);
      }
    }
  );

  // Rest of your component code...
}