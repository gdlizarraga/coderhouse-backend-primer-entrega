import mongoose from "mongoose";

export const conectarDB = async (url, dbName) => {
  try {
    await mongoose.connect(url, {
      dbName,
    });

    console.log(`[DB] Conexión establecida con la base de datos ${dbName}`);
  } catch (error) {
    console.log(
      `[DB] Error al conectar a la base de datos ${dbName}: ${error.message}`
    );
  }
};
