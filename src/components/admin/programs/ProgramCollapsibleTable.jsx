import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import '@/styles/Table.css';

import { ProgramCategoryForm, ProgramForm, ProgramDeleteForm, ProgramCategoryDeleteForm } from '../forms/ProgramForms';
import TextBlock from '../TextBlock';

// ----------------------
// ОТДЕЛЬНАЯ ПРОГРАММА
// ----------------------
function ProgramRow({ program, category }) {
    const [isModalEditProgramOpen, setIsModalEditProgramOpen] = React.useState(false);
    const [isModalDeleteProgramOpen, setIsModalDeleteProgramOpen] = React.useState(false);

    return (
        <React.Fragment>
            {isModalEditProgramOpen && (
                <Dialog open={isModalEditProgramOpen} onClose={() => setIsModalEditProgramOpen(false)}>
                    <DialogTitle>Редагувати програму</DialogTitle>
                    <DialogContent>
                        <ProgramForm category={category} data={program} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsModalEditProgramOpen(false)}>Закрити</Button>
                    </DialogActions>
                </Dialog>
            )}

            {isModalDeleteProgramOpen && (
                <Dialog open={isModalDeleteProgramOpen} onClose={() => setIsModalDeleteProgramOpen(false)}>
                    <DialogTitle>Видалити програму?</DialogTitle>
                    <DialogContent>
                        <ProgramDeleteForm categoryId={category.id} program={program} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsModalDeleteProgramOpen(false)}>Закрити</Button>
                    </DialogActions>
                </Dialog>
            )}

            <TableRow key={program.id}>
                <TableCell component="th" scope="row">{program.name}</TableCell>
                <TableCell><TextBlock text={program.description} max={100} /></TableCell>
                <TableCell>{program.type}</TableCell>
                <TableCell>{program.number_of_lessons}</TableCell>
                <TableCell>{program.lesson_duration}</TableCell>
                <TableCell>{program.course_price}</TableCell>
                <TableCell align="right">
                    <button className='table-button-events' onClick={() => setIsModalEditProgramOpen(true)}><EditIcon /></button>
                    <button className='table-button-events delete' onClick={() => setIsModalDeleteProgramOpen(true)}><DeleteIcon /></button>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

// ----------------------
// КАТЕГОРИЯ + ПРОГРАММЫ ВНУТРИ НЕЁ
// ----------------------
function Row({ row }) {
    const [open, setOpen] = React.useState(false);
    const [isModalCreateProgramOpen, setIsModalCreateProgramOpen] = React.useState(false);
    const [isModalEditCategoryOpen, setIsModalEditCategoryOpen] = React.useState(false);
    const [isModalDeleteCategoryOpen, setIsModalDeleteCategoryOpen] = React.useState(false);

    return (
        <React.Fragment>
            {/* Диалоги для операций над категорией/программой */}
            {isModalCreateProgramOpen && (
                <Dialog open={isModalCreateProgramOpen} onClose={() => setIsModalCreateProgramOpen(false)}>
                    <DialogTitle>Додати програму</DialogTitle>
                    <DialogContent>
                        <ProgramForm category={row} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsModalCreateProgramOpen(false)}>Закрити</Button>
                    </DialogActions>
                </Dialog>
            )}

            {isModalEditCategoryOpen && (
                <Dialog open={isModalEditCategoryOpen} onClose={() => setIsModalEditCategoryOpen(false)}>
                    <DialogTitle>Редагувати категорію</DialogTitle>
                    <DialogContent>
                        <ProgramCategoryForm category={row} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsModalEditCategoryOpen(false)}>Закрити</Button>
                    </DialogActions>
                </Dialog>
            )}

            {isModalDeleteCategoryOpen && (
                <Dialog open={isModalDeleteCategoryOpen} onClose={() => setIsModalDeleteCategoryOpen(false)}>
                    <DialogTitle>Видалити категорію</DialogTitle>
                    <DialogContent>
                        <ProgramCategoryDeleteForm category={row} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsModalDeleteCategoryOpen(false)}>Закрити</Button>
                    </DialogActions>
                </Dialog>
            )}

            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">{row.category_name}</TableCell>
                <TableCell><TextBlock text={row.description} max={200} /></TableCell>
                <TableCell align="right">
                    <button className='table-button-events' onClick={() => setIsModalEditCategoryOpen(true)}><EditIcon /></button>
                    <button className='table-button-events delete' onClick={() => setIsModalDeleteCategoryOpen(true)}><DeleteIcon /></button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} style={{ backgroundColor: "#f7f7f7" }} timeout="auto">
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Програми
                            </Typography>
                            <Table size="small" aria-label="programs">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Назва програми</b></TableCell>
                                        <TableCell><b>Опис програми</b></TableCell>
                                        <TableCell><b>Тип</b></TableCell>
                                        <TableCell><b>Кількість занять</b></TableCell>
                                        <TableCell><b>Тривалість заняття</b></TableCell>
                                        <TableCell><b>Ціна курсу</b></TableCell>
                                        <TableCell align="right"><b>Дії</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(row.programs || []).map((program) => (
                                        <ProgramRow key={program.id} program={program} category={row} />
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <button onClick={() => setIsModalCreateProgramOpen(true)}><AddIcon /></button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

// ----------------------
// ПРОП ТАЙПЫ
// ----------------------
Row.propTypes = {
    row: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        category_name: PropTypes.string.isRequired,
        description: PropTypes.string,
        programs: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                name: PropTypes.string.isRequired,
                description: PropTypes.string,
                type: PropTypes.string,
                number_of_lessons: PropTypes.string,
                lesson_duration: PropTypes.string,
                course_duration: PropTypes.string,
                course_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                image_path: PropTypes.string,
                created_at: PropTypes.string,
                category_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            })
        ),
    }).isRequired,
};

// ----------------------
// ГЛАВНАЯ ТАБЛИЦА
// ----------------------
export default function ProgramCollapsibleTable({ rows }) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <React.Fragment>
            {isModalOpen && (
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <DialogTitle>Додати категорію</DialogTitle>
                    <DialogContent>
                        <ProgramCategoryForm />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsModalOpen(false)}>Закрити</Button>
                    </DialogActions>
                </Dialog>
            )}
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell><b>Назва категорії</b></TableCell>
                            <TableCell><b>Опис категорії</b></TableCell>
                            <TableCell align="right"><b>Дії</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rows || []).map((row) => (
                            <Row key={row.id} row={row} />
                        ))}
                        <TableRow>
                            <TableCell colSpan={4}>
                                <button onClick={() => setIsModalOpen(true)}><AddIcon /></button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>
    );
}
