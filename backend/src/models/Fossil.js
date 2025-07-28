module.exports = (sequelize, DataTypes) => {
  const Fossil = sequelize.define('Fossil', {
    especie: DataTypes.STRING,
    familia: DataTypes.STRING,
    descricao: DataTypes.TEXT,
    localizacao: DataTypes.STRING,
    imageUrl: DataTypes.STRING
  });

  return Fossil;
};
