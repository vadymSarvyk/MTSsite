import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { PartnerForm, PartnerDeleteForm } from '../forms/PartnerForms';
import { createClient } from '@/utils/supabase/client'
import '@/styles/Table.css'

const SUPABASE_PARTNERS_BUCKET = 'partners-images'
const PLACEHOLDER = '/placeholder.png'

function PartnerImage({ image_path }) {
  const [imgUrl, setImgUrl] = React.useState(PLACEHOLDER)

  React.useEffect(() => {
    if (image_path) {
      const supabase = createClient()
      const { data } = supabase
        .storage
        .from(SUPABASE_PARTNERS_BUCKET)
        .getPublicUrl(image_path)
      if (data?.publicUrl) setImgUrl(data.publicUrl)
      else setImgUrl(PLACEHOLDER)
    } else {
      setImgUrl(PLACEHOLDER)
    }
  }, [image_path])

  return (
    <img src={imgUrl} style={{ height: "100px", objectFit: "contain" }} alt="" onError={e => e.target.src = PLACEHOLDER} />
  )
}

const PartnerRow = ({ data }) => {
  const [isModalEditPartnerOpen, setIsModalEditPartnerOpen] = React.useState(false)
  const [isModalDeletePartnerOpen, setIsModalDeletePartnerOpen] = React.useState(false)

  const openModalEditPartner = () => setIsModalEditPartnerOpen(true)
  const closeModalEditPartner = () => setIsModalEditPartnerOpen(false)
  const openModalDeletePartner = () => setIsModalDeletePartnerOpen(true)
  const closeModalDeletePartner = () => setIsModalDeletePartnerOpen(false)

  return (
    <React.Fragment>
      {isModalEditPartnerOpen && (
        <Dialog open={isModalEditPartnerOpen} onClose={closeModalEditPartner}>
          <DialogTitle>Оновити партнера</DialogTitle>
          <DialogContent>
            <PartnerForm initialData={data} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModalEditPartner}>Закрити</Button>
          </DialogActions>
        </Dialog>
      )}

      {isModalDeletePartnerOpen && (
        <Dialog open={isModalDeletePartnerOpen} onClose={closeModalDeletePartner}>
          <DialogTitle>Видалити партнера</DialogTitle>
          <DialogContent>
            <PartnerDeleteForm partner={data} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModalDeletePartner}>Закрити</Button>
          </DialogActions>
        </Dialog>
      )}

      <TableRow
        key={data.id}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {data.url}
        </TableCell>
        <TableCell>
          <PartnerImage image_path={data.image_path} />
        </TableCell>
        <TableCell align="right">
          <button className='table-button-events' onClick={openModalEditPartner}><EditIcon /></button>
          <button className='table-button-events delete' onClick={openModalDeletePartner}><DeleteIcon /></button>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default function PartnerTable({ rows }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  return (
    <React.Fragment>
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={closeModal}>
          <DialogTitle>Додати партнера</DialogTitle>
          <DialogContent>
            <PartnerForm />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>Закрити</Button>
          </DialogActions>
        </Dialog>
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell><b>URL партнера</b></TableCell>
              <TableCell><b>Логотип</b></TableCell>
              <TableCell align="right"><b>Дії</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <PartnerRow key={row.id} data={row} />
            ))}
            <TableCell><button onClick={openModal}><AddIcon /></button></TableCell>
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
}
