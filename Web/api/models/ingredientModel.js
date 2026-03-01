const supabase = require('../supabase');

const Ingredient = {
  //add function
  async add(name, userId) {
    const { data, error } = await supabase
      .from('ingredients')
      .upsert(
        { name: name, user_id: userId }, 
        { onConflict: 'name, user_id' } 
      )
      .select();

    if (error) {
      console.error("Insert Error:", error);
      throw error;
    }
    return data;
  },
  //remove function
  async remove(name, userId) {
    const { data, error } = await supabase
      .from('ingredients')
      .delete()
      .match({ name: name, user_id: userId }); 

    if (error) {
      console.error("Delete Error:", error);
      throw error;
    }
    return data;
  }
};
module.exports = Ingredient;