import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { Paciente } from '../clases/paciente';
import { Especialista } from '../clases/especialista';
import { Admin } from '../clases/admin';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore : Firestore) { }

  async saveEspecialidad(especialidad: any)
  {
    const especialidadesCollection = collection(this.firestore, 'especialidades');

    const docRef = await addDoc(especialidadesCollection, {
      nombre: especialidad     
    });

    return docRef.id;
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
      foto2: paciente.foto2
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
      acceso: false
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
    });

    return documentoId;
  }

  async darAccesoEspecialista(especialista: any){
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
      acceso: true
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
}
