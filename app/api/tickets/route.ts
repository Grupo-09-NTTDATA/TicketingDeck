import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

// Configuración de Auth (Reutilizable)
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// GET: Lee los tickets del Sheet para el Dashboard
export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const tickets = rows.map(row => ({
      id: row.get('id'),
      title: row.get('title'),
      description: row.get('description'),
      priority: row.get('priority'),
      status: row.get('status'),
      requesterId: row.get('requesterId'),
      requesterEmail: row.get('requesterEmail'),
      createdAt: row.get('createdAt'),
      assignedTo: row.get('assignedTo'),
      // Convertimos los strings de vuelta a objetos/arrays
      comments: JSON.parse(row.get('comments') || '[]'),
      auditLog: JSON.parse(row.get('auditLog') || '[]'),
      changeHistory: JSON.parse(row.get('changeHistory') || '[]'),
      subtasks: JSON.parse(row.get('subtasks') || '[]'),
    }));

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error leyendo Sheets:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST: Registra un nuevo ticket de Soltrak
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // IMPORTANTE: Serializar arrays a JSON para que quepan en una celda
    await sheet.addRow({
      id: body.id,
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: body.status || 'nuevo',
      requesterId: body.requesterId,
      requesterEmail: body.requesterEmail,
      createdAt: body.createdAt || new Date().toISOString(),
      assignedTo: body.assignedTo || '',
      comments: JSON.stringify(body.comments || []),
      auditLog: JSON.stringify(body.auditLog || []),
      changeHistory: JSON.stringify(body.changeHistory || []),
      subtasks: JSON.stringify(body.subtasks || []),
    });

    return NextResponse.json({ success: true, message: 'Ticket registrado en Soltrak' });
  } catch (error) {
    console.error('Error en API Sheets:', error);
    return NextResponse.json({ success: false, error: 'Error de conexión' }, { status: 500 });
  }
}

// PUT: Actualiza un ticket existente (Cambio de estado, asignación, comentarios)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del ticket" }, { status: 400 });
    }

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    // Descargamos todas las filas para buscar la que corresponde al ID
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) {
      console.error(`Ticket ${id} no encontrado en Sheets.`);
      return NextResponse.json({ error: "Ticket no encontrado en Sheets" }, { status: 404 });
    }

    // Actualizamos campos de texto simple si vienen en los updates
    if (updates.title !== undefined) row.assign({ title: updates.title });
    if (updates.description !== undefined) row.assign({ description: updates.description });
    if (updates.priority !== undefined) row.assign({ priority: updates.priority });
    if (updates.status !== undefined) row.assign({ status: updates.status });
    if (updates.assignedTo !== undefined) row.assign({ assignedTo: updates.assignedTo });
    
    // Actualizamos arreglos (serializándolos a JSON como en el POST)
    if (updates.changeHistory !== undefined) row.assign({ changeHistory: JSON.stringify(updates.changeHistory) });
    if (updates.comments !== undefined) row.assign({ comments: JSON.stringify(updates.comments) });
    if (updates.subtasks !== undefined) row.assign({ subtasks: JSON.stringify(updates.subtasks) });
    if (updates.auditLog !== undefined) row.assign({ auditLog: JSON.stringify(updates.auditLog) });

    // Guardamos los cambios en la hoja de Google
    await row.save();
    
    console.log(`Ticket ${id} actualizado exitosamente.`);
    return NextResponse.json({ success: true, message: `Ticket ${id} actualizado correctamente` });

  } catch (error) {
    console.error("Error al actualizar Sheets:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor al actualizar" }, { status: 500 });
  }
}
