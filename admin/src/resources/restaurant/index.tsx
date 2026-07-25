import {
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  SelectInput,
  Show,
  SimpleShowLayout,
  TextField,
  BooleanField,
  NumberField,
  required,
  useRedirect,
  useGetOne,
  Loading,
} from 'react-admin';
import { useEffect } from 'react';

const categoryChoices = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'food', name: 'Food' },
  { id: 'bar', name: 'Bar' },
  { id: 'sports', name: 'Sports' },
  { id: 'courses', name: 'Courses' },
  { id: 'restaurant', name: 'Restaurant' },
];

export const RestaurantList = () => {
  const redirect = useRedirect();
  const { data, isLoading } = useGetOne('restaurant', { id: 'current' });

  useEffect(() => {
    if (data?.id) {
      redirect('edit', 'restaurant', data.id);
    }
  }, [data, redirect]);

  if (isLoading) {
    return <Loading />;
  }

  return null;
};

export const RestaurantShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="category" />
      <TextField source="address" />
      <TextField source="description" />
      <NumberField source="rating" />
      <BooleanField source="isOpen" />
      <TextField source="imageUrl" />
      <TextField source="icon" />
      <TextField source="iconColor" />
    </SimpleShowLayout>
  </Show>
);

export const RestaurantEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" fullWidth validate={required()} />
      <SelectInput source="category" choices={categoryChoices} />
      <TextInput source="address" fullWidth validate={required()} />
      <TextInput source="description" multiline fullWidth />
      <NumberInput source="rating" />
      <BooleanInput source="isOpen" />
      <TextInput source="imageUrl" fullWidth />
      <TextInput source="icon" />
      <TextInput source="iconColor" />
    </SimpleForm>
  </Edit>
);
