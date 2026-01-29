'use strict';
module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
        schedule_id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        doctor_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        day_of_week: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        max_appointments: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'schedules',
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Schedule;
};
