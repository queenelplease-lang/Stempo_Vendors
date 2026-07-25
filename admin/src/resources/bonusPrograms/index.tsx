import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  NumberInput,
  Create,
  required,
} from 'react-admin';

const bonusProgramStatusChoices = [
  { id: 'pending', name: 'Pending' },
  { id: 'approved', name: 'Approved' },
  { id: 'rejected', name: 'Rejected' },
  { id: 'active', name: 'Active' },
];

const discountTypeChoices = [
  { id: 'percentage', name: 'Percentage' },
  { id: 'fixed', name: 'Fixed' },
];

export const BonusProgramList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="description" />
      <NumberField source="pointsRequired" />
      <NumberField source="discount" />
      <TextField source="discountType" />
      <TextField source="status" />
      <DateField source="createdAt" showTime />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const BonusProgramShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="description" />
      <NumberField source="businessId" />
      <NumberField source="pointsRequired" />
      <NumberField source="points" />
      <NumberField source="discount" />
      <TextField source="discountType" />
      <TextField source="status" />
      <DateField source="expiresAt" showTime />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);

export const BonusProgramEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={required()} />
      <TextInput source="description" multiline />
      <NumberInput source="pointsRequired" />
      <NumberInput source="points" />
      <NumberInput source="discount" />
      <SelectInput source="discountType" choices={discountTypeChoices} />
      <SelectInput source="status" choices={bonusProgramStatusChoices} />
    </SimpleForm>
  </Edit>
);

export const BonusProgramCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} />
      <TextInput source="description" multiline />
      <NumberInput source="pointsRequired" defaultValue={10} />
      <NumberInput source="points" defaultValue={0} />
      <NumberInput source="discount" defaultValue={0} />
      <SelectInput source="discountType" choices={discountTypeChoices} defaultValue="percentage" />
    </SimpleForm>
  </Create>
);
