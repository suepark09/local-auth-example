
exports.up = function(knex) {
    return knex.schema.createTable('Assignments', (table) => {
        table.increments('id')
        table.string('assignment_title')
        table.integer('grade')
        table.string('student_name')
        table.foreign('student_name').references('student.name')
      })
};

exports.down = function(knex) {
    return knex.schema.raw('DROP TABLE Assignments')
};
