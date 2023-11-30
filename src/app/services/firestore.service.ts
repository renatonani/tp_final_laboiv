import { Injectable } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Paciente } from '../clases/paciente';
import { Especialista } from '../clases/especialista';
import { Admin } from '../clases/admin';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore : Firestore) { }

  async saveEspecialidad(especialidad: any): Promise<string> {
    // Cargar la imagen desde los assets
    const image = await this.loadImageFromAssets("../../assets/especialidad.png");

    // Convertir la imagen a base64
    const base64Image = await this.convertImageToBase64(image);

    // Crear una referencia a la colección 'especialidades'
    const especialidadesCollection = collection(this.firestore, 'especialidades');

    // Agregar un documento con nombre y foto a la colección
    const docRef = await addDoc(especialidadesCollection, {
      nombre: especialidad,
      foto: base64Image,
    });

    return docRef.id;
  }

  private async loadImageFromAssets(imagePath: string): Promise<string> {
    

    // Cargar la imagen como un recurso
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    // Obtener la imagen en formato base64
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    });
  }

  public async getEspecialidades() {
    const especialidadesCollection = collection(this.firestore, 'especialidades');
    const querySnapshot = await getDocs(especialidadesCollection);
  
    // Usar `docs` para obtener tanto los datos como las IDs de los documentos
    const especialidades = querySnapshot.docs.map(doc => {
      return {
        id: doc.id,  // Obtener la ID del documento
        ...doc.data()  // Obtener los datos del documento
      };
    });
  
    return especialidades;
  }

  async savePaciente(paciente: Paciente,  documentoId: string)
  {
    const pacientesCollection = collection(this.firestore, 'pacientes');
    const pacienteDocRef = doc(pacientesCollection, documentoId);

    await setDoc(pacienteDocRef, {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      edad: paciente.edad,
      DNI: paciente.DNI,
      obraSocial: paciente.obraSocial,
      mail: paciente.mail,
      password: paciente.password,
      foto1: paciente.foto1,
      foto2: paciente.foto2,
      rol: "paciente"

    });

    return documentoId;
  }

  public async getPacientes() {
    const pacientesCollection = collection(this.firestore, 'pacientes');
    const querySnapshot = await getDocs(pacientesCollection);
  
    // Usar `docs` para obtener tanto los datos como las IDs de los documentos
    const pacientes = querySnapshot.docs.map(doc => {
      return {
        id: doc.id,  // Obtener la ID del documento
        ...doc.data()  // Obtener los datos del documento
      };
    });
  
    return pacientes;
  }

  async saveEspecialista(especialista: Especialista, documentoId: string)
  {
    const especialistasCollection = collection(this.firestore, 'especialistas');
    const especialistaDocRef = doc(especialistasCollection, documentoId);

    await setDoc(especialistaDocRef, {
      nombre: especialista.nombre,
      apellido: especialista.apellido,
      edad: especialista.edad,
      DNI: especialista.DNI,
      especialidad: especialista.especialidad,
      mail: especialista.mail,
      password: especialista.password,
      foto1: especialista.foto1,
      acceso: false,
      rol: "especialista",
      turno: "mañana"
    });

    return documentoId;
  }

  public async getEspecialistas() {
    const especialistasCollection = collection(this.firestore, 'especialistas');
    const querySnapshot = await getDocs(especialistasCollection);
  
    // Usar `docs` para obtener tanto los datos como las IDs de los documentos
    const especialistas = querySnapshot.docs.map(doc => {
      return {
        id: doc.id,  // Obtener la ID del documento
        ...doc.data()  // Obtener los datos del documento
      };
    });
  
    return especialistas;
  }

  async saveAdmin(admin: Admin, documentoId: string)
  {
    const adminsCollection = collection(this.firestore, 'admins');
    const adminDocRef = doc(adminsCollection, documentoId);

    await setDoc(adminDocRef, {
      nombre: admin.nombre,
      apellido: admin.apellido,
      edad: admin.edad,
      DNI: admin.DNI,      
      mail: admin.mail,
      password: admin.password,
      foto1: admin.foto1,
      rol: "admin"
    });

    return documentoId;
  }

  async darAccesoEspecialista(especialista: any, acceso : boolean){
    const especialistasCollection = collection(this.firestore, 'especialistas');
    const especialistaDocRef = doc(especialistasCollection, especialista.id);

    await setDoc(especialistaDocRef, {      
      nombre: especialista.nombre,
      apellido: especialista.apellido,
      edad: especialista.edad,
      DNI: especialista.DNI,
      especialidad: especialista.especialidad,
      mail: especialista.mail,
      password: especialista.password,
      foto1: especialista.foto1,
      acceso: acceso,
      rol: "especialista"
    });
  }

  public async getAdmins() {
    const adminsCollection = collection(this.firestore, 'admins');
    const querySnapshot = await getDocs(adminsCollection);
  
    // Usar `docs` para obtener tanto los datos como las IDs de los documentos
    const admins = querySnapshot.docs.map(doc => {
      return {
        id: doc.id,  // Obtener la ID del documento
        ...doc.data()  // Obtener los datos del documento
      };
    });
  
    return admins;
  }  

  public async getUserById(userId: string, tabla: string) {
    const usersCollection = collection(this.firestore, tabla);
    const userDoc = doc(usersCollection, userId);
    const userSnapshot = await getDoc(userDoc);
  
    if (userSnapshot.exists()) {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data()
      };
    } else {
      return null;
    }
  }

  public async getEspecialistasPorEspecialidad(especialidadBuscada: string) {
    const especialistasCollection = collection(this.firestore, 'especialistas');
    const querySnapshot = await getDocs(especialistasCollection);
  
    // Filtrar los especialistas que tengan la especialidad buscada
    const especialistas = querySnapshot.docs.map(doc => {
      const especialistaData = doc.data();
      const especialidades = especialistaData['especialidad'].split(", "); // Separar las especialidades
  
      if (especialidades.includes(especialidadBuscada)) {
        return {
          id: doc.id,
          ...especialistaData
        };
      } else {
        return null; // No se incluirá en la lista final
      }
    }).filter(especialista => especialista !== null); // Filtrar los elementos nulos
  
    return especialistas;
  }

  async saveTurno(turno: any)
  {
    const turnosCollection = collection(this.firestore, 'turnos');
    const docRef = await addDoc(turnosCollection, {
      especialistaID: turno.especialistaID,
      dia: turno.dia,
      horario: turno.horario,
      pacienteID: turno.pacienteID, 
      estado: turno.estado,  
      especialidad: turno.especialidad,
    });

    return docRef.id;
  }

  public getTurnos(): Observable<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection);
  
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const turnos = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        observer.next(turnos);
      });
  
      return () => unsubscribe();
    });
  }

  public getTurnosPorPaciente(pacienteID: string): Observable<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection, where('pacienteID', '==', pacienteID));
  
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const turnos = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        observer.next(turnos);
      });
  
      return () => unsubscribe();
    });
  }

  public getTurnosPorPacienteYEspecialidad(pacienteID: string, especialidad: string): Observable<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection, 
      where('pacienteID', '==', pacienteID),
      where('especialidad', '==', especialidad)
    );
  
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const turnos = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        observer.next(turnos);
      });
  
      return () => unsubscribe();
    });
  }

  public getTurnosPorEspecialidad(especialidad: string): Observable<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection, 
      where('especialidad', '==', especialidad)
    );
  
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const turnos = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        observer.next(turnos);
      });
  
      return () => unsubscribe();
    });
  }
  
  public getTurnosPorPacienteYEspecialista(pacienteID: string, especialistaID: string): Observable<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection, 
      where('pacienteID', '==', pacienteID),
      where('especialistaID', '==', especialistaID)
    );
  
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const turnos = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        observer.next(turnos);
      });
  
      return () => unsubscribe();
    });
  }
  
  public async getEspecialistaPorID(especialistaID: string) {
    const especialistaDoc = await getDoc(doc(this.firestore, 'especialistas', especialistaID));
  
    if (especialistaDoc.exists()) {
      return {
        id: especialistaDoc.id,
        ...especialistaDoc.data()
      };
    } else {
      return null;
    }
  }


  public getTurnosPorEspecialista(especialistaID: string): Observable<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection, where('especialistaID', '==', especialistaID));
  
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const turnos = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        observer.next(turnos);
      });
  
      return () => unsubscribe();
    });
  }

  public async getPacientePorID(pacienteID: string) {
    const pacienteDoc = await getDoc(doc(this.firestore, 'pacientes', pacienteID));
  
    if (pacienteDoc.exists()) {
      return {
        id: pacienteDoc.id,
        ...pacienteDoc.data()
      };
    } else {
      return null;
    }
  }

  public getTurnosPorEspecialistaYEspecialidad(especialistaID: string, especialidad: string): Observable<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection, 
      where('especialistaID', '==', especialistaID),
      where('especialidad', '==', especialidad)
    );
  
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const turnos = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        observer.next(turnos);
      });
  
      return () => unsubscribe();
    });
  }

  public async getEspecialidadesPorEspecialista(especialistaID: string) {
    const especialistaRef = doc(this.firestore, 'especialistas', especialistaID);
  
    try {
      const especialistaDoc = await getDoc(especialistaRef);
  
      if (especialistaDoc.exists()) {
        const data = especialistaDoc.data();
        if (data && data['especialidad']) {
          const especialidades = data['especialidad'].includes(',')
            ? data['especialidad'].split(',').map((e: string) => e.trim())
            : [data['especialidad']];
  
          return especialidades;
        }
      }
  
      // Si no se encuentra el especialista o no tiene especialidades, devolver un array vacío
      return [];
    } catch (error) {
      console.error('Error obteniendo especialidades del especialista:', error);
      throw error;
    }
  }

  async cambiarTurnoEspecialista(documentoId: string, nuevoTurno: string): Promise<void> {
    const especialistasCollection = collection(this.firestore, 'especialistas');
    const especialistaDocRef = doc(especialistasCollection, documentoId);
  
    await updateDoc(especialistaDocRef, {
      turno: nuevoTurno
    });
  }

  
  async cancelarTurno(documentoId: string, nuevoEstado: string, motivo: string): Promise<void> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const turnoDocRef = doc(turnosCollection, documentoId);
  
    await updateDoc(turnoDocRef, {
      estado : nuevoEstado,
      motivo: motivo
    });
  }

  async atencionTurno(documentoId: string, atencion: string): Promise<void> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const turnoDocRef = doc(turnosCollection, documentoId);
  
    await updateDoc(turnoDocRef, {      
      atencion : atencion
    });
  }

  async encuestaTurno(documentoId: string, encuesta: string): Promise<void> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const turnoDocRef = doc(turnosCollection, documentoId);
  
    await updateDoc(turnoDocRef, {      
      encuesta: encuesta
    });
  }
  
  async aceptarTurno(documentoId: string): Promise<void> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const turnoDocRef = doc(turnosCollection, documentoId);
  
    await updateDoc(turnoDocRef, {      
      estado: "aceptado"
    });
  }

  async reseniaTurno(documentoId: string, resenia: string): Promise<void> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const turnoDocRef = doc(turnosCollection, documentoId);
  
    await updateDoc(turnoDocRef, {  
      estado: "realizado",    
      resenia: resenia,
      historiaClinica: false
    });
  }

  async guardarHistoriaClinica(especialista: any,turno: any, historia: any)
  {
    const historiasCollection = collection(this.firestore, 'historias');
    const docRef = await addDoc(historiasCollection, {
      pacienteID: turno.pacienteID,
      altura: historia.altura,
      peso: historia.peso,
      temperatura: historia.temperatura,
      presion: historia.presion,
      datosDinamicos: historia.datosDinamicos,
      especialista: especialista.nombre + " " + especialista.apellido,
      fecha: turno.dia
    });

    const turnosCollection = collection(this.firestore, 'turnos');
    const turnoDocRef = doc(turnosCollection, turno.id);
  
    await updateDoc(turnoDocRef, { 
      historiaClinica: docRef.id
    });

    return docRef.id;
  }

  getHistoriasClinicasPorPaciente(pacienteID: string): Observable<any[]> {
    const historiasCollection = collection(this.firestore, 'historias');
    const q = query(historiasCollection, where('pacienteID', '==', pacienteID));

    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historias = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        observer.next(historias);
      });

      return () => unsubscribe();
    });
  }  

  getHistoriasClinicas(): Observable<any[]> {
    const historiasCollection = collection(this.firestore, 'historias');
    const q = query(historiasCollection);

    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historias = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        observer.next(historias);
      });

      return () => unsubscribe();
    });
  }  

  async getHistoriaClinicaPorId(historiaId: string): Promise<any> {
    if (!historiaId) {
      return null;
    }

    const historiaRef = doc(this.firestore, 'historias', historiaId);

    try {
      const historiaDoc = await getDoc(historiaRef);

      if (historiaDoc.exists()) {
        const historiaData = historiaDoc.data();
        return historiaData;
      } else {
        return null; // Si no se encuentra la historia clínica
      }
    } catch (error) {
      console.error('Error obteniendo historia clínica por ID:', error);
      throw error;
    }
  }
  
  public async getUltimosTurnosPorEspecialista(especialistaID: string, pacienteID?: string): Promise<Turno[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    let q = query(turnosCollection, where('especialistaID', '==', especialistaID));
  
    if (pacienteID) {
      q = query(q, where('pacienteID', '==', pacienteID));
    }
  
    try {
      const querySnapshot = await getDocs(q);
      const turnos: Turno[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Turno;
      }).filter(turno => turno.historiaClinica);
  
      // Ordenar los turnos por la fecha en orden descendente
      turnos.sort((a, b) => (a.dia < b.dia ? 1 : -1));
  
      // Limitar a los 3 primeros turnos
      const ultimosTurnos = turnos.slice(0, 3);
  
      return ultimosTurnos;
    } catch (error) {
      console.error('Error al obtener los turnos:', error);
      throw error;
    }
  }
  
  async registrarIngreso(usuarioID: any)
  {
    // Obtener la fecha y hora actual en Argentina
    const fechaHoraArgentina = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
   
    const ingresosCollection = collection(this.firestore, 'logIngresos');
    const docRef = await addDoc(ingresosCollection, {
      usuarioID: usuarioID, 
      timestap: fechaHoraArgentina     
    });

    return docRef.id;
  }

  traerIngresos()
  {
    const ingresosCollection = collection(this.firestore, 'logIngresos');
    const q = query(ingresosCollection);
  
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ingresos = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        observer.next(ingresos);
      });
  
      return () => unsubscribe();
    });
  }

  async obtenerDocumentoPorID(id: string): Promise<any | null> {
    const especialistasRef = doc(collection(this.firestore, 'especialistas'), id);
    const adminsRef = doc(collection(this.firestore, 'admins'), id);
    const pacientesRef = doc(collection(this.firestore, 'pacientes'), id);

    const especialistaDoc = await this.obtenerDocumento(especialistasRef);
    const adminDoc = await this.obtenerDocumento(adminsRef);
    const pacienteDoc = await this.obtenerDocumento(pacientesRef);

    // Verificar cuál documento existe y retornar el correspondiente
    if (especialistaDoc.exists()) {      
        return { tipo: 'especialista', data: especialistaDoc.data() };
    } else if (adminDoc.exists()) {
        return { tipo: 'admin', data: adminDoc.data() };
    } else if (pacienteDoc.exists()) {
        return { tipo: 'paciente', data: pacienteDoc.data() };
    } else {
        return null; // Ningún documento encontrado con el ID proporcionado
    }
  }

  private async obtenerDocumento(docRef: any){
    const docSnap = await getDoc(docRef);
    return docSnap;
  }
  
  async obtenerCantidadTurnosPorEspecialidad(): Promise<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection);
  
    const querySnapshot = await getDocs(q);
  
    const especialidadesCount: Record<string, number> = {};
  
    querySnapshot.forEach((doc) => {
      const especialidad = doc.data()['especialidad'];
  
      if (especialidadesCount[especialidad]) {
        especialidadesCount[especialidad]++;
      } else {
        especialidadesCount[especialidad] = 1;
      }
    });
  
    // Convertir el objeto a un array de objetos
    const resultado = Object.keys(especialidadesCount).map((especialidad) => ({
      especialidad,
      cantidad: especialidadesCount[especialidad]
    }));
  
    return resultado;
  }
  
  async obtenerCantidadTurnosPorDia(): Promise<any[]> {
    const turnosCollection = collection(this.firestore, 'turnos');
    const q = query(turnosCollection);
  
    const querySnapshot = await getDocs(q);
  
    const turnosPorDiaCount: Record<string, number> = {};
  
    querySnapshot.forEach((doc) => {
      const dia = doc.data()['dia'];
  
      if (turnosPorDiaCount[dia]) {
        turnosPorDiaCount[dia]++;
      } else {
        turnosPorDiaCount[dia] = 1;
      }
    });
  
    // Convertir el objeto a un array de objetos
    const resultado = Object.keys(turnosPorDiaCount).map((dia) => ({
      dia,
      cantidad: turnosPorDiaCount[dia]
    }));
  
    return resultado;
  }

  async getPacientesParaEspecialista(especialistaID: string) {
    const turnosCollection = collection(this.firestore, 'turnos');
    const turnosQuery = query(turnosCollection, where('especialistaID', '==', especialistaID));
    const turnosSnapshot = await getDocs(turnosQuery);
  
    const pacientesSet = new Set<string>();
  
    turnosSnapshot.forEach((doc) => {
      const turnoData = doc.data();
      if (turnoData['estado'] === 'realizado') {
        pacientesSet.add(turnoData['pacienteID']);
      }
    });
  
    const pacientesDetallados = await Promise.all(
      Array.from(pacientesSet).map(async (pacienteID) => {
        const paciente = await this.getPacientePorID(pacienteID);
        return paciente;
      })
    );
  
    return pacientesDetallados.filter((paciente) => paciente !== null);
  }

  async getTurnosSolicitadosEnLapsoDeTiempo(inicio: Date, fin: Date, estado:string): Promise<any[]> {
    try {
      const turnosCollection = collection(this.firestore, 'turnos');
      const querySnapshot = await getDocs(query(turnosCollection, where('estado', '==', estado)));
  
      const turnos: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fechaString = data['dia'];
  
        console.log('Fecha del documento:', fechaString);
  
        // Parsea la fecha almacenada como string en el formato 'dd/mm/yyyy'
        const fechaTurno = this.parseFechaString(fechaString);
  
        // Verifica si la fecha está en el rango especificado
        if (fechaTurno && fechaTurno >= inicio && fechaTurno <= fin) {
          const turno: { id: string; dia: any } = {
            id: doc.id, ...data,
            dia: fechaTurno,
          };
  
          console.log('Turno después de la conversión:', turno);
  
          turnos.push(turno);
        }
      });
  
      return turnos;
    } catch (error) {
      console.error('Error en getTurnosSolicitadosEnLapsoDeTiempo:', error);
      throw error;
    }
  }

  parseFechaString(fechaString: string): Date | null {
    const partes = fechaString.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Restamos 1 ya que los meses van de 0 a 11 en JavaScript
      const anio = parseInt(partes[2], 10);
  
      if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio)) {
        return new Date(anio, mes, dia);
      }
    }
  
    console.error('Error al parsear la fecha:', fechaString);
    return null;
  }
  

  public async prepararDatosParaGrafico(inicio: Date, fin: Date, estado:string): Promise<any[]> {
    try {
      const turnosSolicitados = await this.getTurnosSolicitadosEnLapsoDeTiempo(inicio, fin, estado);
  
      const especialistas: { [key: string]: { nombre: string; apellido: string; cantidad: number } } = {};
  
      for (const turno of turnosSolicitados) {
        const especialistaID = turno.especialistaID;
  
        // Verificar si ya se obtuvo la información del especialista
        if (!especialistas[especialistaID]) {
          const especialistaInfo = await this.getEspecialistaPorID(especialistaID);
  
          // Verificar si el resultado de getEspecialistaPorID es del tipo esperado
          if (especialistaInfo && 'nombre' in especialistaInfo && 'apellido' in especialistaInfo) {
            // Almacenar la información del especialista
            console.log('EspecialistaInfo:', especialistaInfo);
            especialistas[especialistaID] = {
              nombre: especialistaInfo.nombre as string,
              apellido: especialistaInfo.apellido as string,
              cantidad: 0,
            };
          } else {
            console.error('El resultado de getEspecialistaPorID no tiene la estructura esperada:', especialistaInfo);
          }
        }
  
        // Incrementar la cantidad de turnos solicitados para el especialista
        if (especialistas[especialistaID]) {
          especialistas[especialistaID].cantidad++;
        }
      }
  
      // Convertir el objeto a un array de objetos con las propiedades correctas
      const datosParaGrafico = Object.entries(especialistas).map(([especialistaID, especialista]) => {
        return {
          especialistaID,
          nombre: especialista.nombre,
          apellido: especialista.apellido,
          cantidad: especialista.cantidad,
        };
      });
  
      console.log('Datos para el gráfico:', datosParaGrafico);
  
      return datosParaGrafico;
    } catch (error) {
      console.error('Error en prepararDatosParaGrafico:', error);
      return [];
    }
  }  
  
}

interface Turno {
  id: string;
  historiaClinica?: string; // Puedes ajustar el tipo según la estructura real de tu datos
  dia: string;
  // Otras propiedades...
}

