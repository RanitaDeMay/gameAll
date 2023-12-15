export interface Juegos{
    nombreJuego: string;
    autor: string;
    genero: string;
    imagen: string;
    lanzamiento: Date;
    sinopsis: string,
    resenas?: ContenidoResenas[];
  }

export interface ContenidoResenas {
    autor: string;
    calificacion: number;
    contenido: string;
    fecha: Date;
    tituloResena: string;
    votos: number;
}