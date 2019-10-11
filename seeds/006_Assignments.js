
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('Assignments').del()
    .then(function () {
      // Inserts seed entries
      return knex('Assignments').insert([
        {
          id: 1, 
          assignment_title: 'Phase one project',
          grade: 'B',
          student_name: 'Aubrey Snider'
        },
        {
          id: 2, 
          assignment_title: 'Phase one project',
          grade: 'B',
          student_name: 'Joey'
        },
        {
          id: 3, 
          assignment_title: 'Phase one project',
          grade: 'B',
          student_name: 'Ryan'
        }
      ]);
    });
};
