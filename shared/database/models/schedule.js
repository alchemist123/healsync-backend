'use strict';

module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define(
        'Schedule',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            doctor_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            department_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            institution_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            schedule_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            day_of_week: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            start_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            end_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            max_appointments: {
                type: DataTypes.INTEGER,
                defaultValue: 10,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: 'schedules',
            schema: 'consultation',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );

    Schedule.associate = (models) => {
        Schedule.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
        Schedule.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
    };

    return Schedule;
};
