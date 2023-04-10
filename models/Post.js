import mongoose from 'mongoose'
//создаём схему
//все свойства которые передаём как обязательные они прописываются как объект
//если не обязательные то как просто тип...например avatarUrl:String
const PostSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			required: true,
			unique: true,
		},
		//количество просмотров статьи
		//optional
		viewCountPost: {
			type: Number,
			//так как viewCountPost это опциональная инфа(может и не передаваться)...то в этом случае пусть будет приходить 0(ноль)
			default: 0,
		},
		authorPost: {
			//мы в user должны хранить _id, а т.к. в DB _id имеет опред тип это type : ObjectId.То мы прописываем специальный тип
			type: mongoose.Schema.Types.ObjectId,
			//Далее объясняем что св-во authorPost будет ссылаться на опред модель
			//Если нужно будет найти пользака то по вот этому св-ву и id (type: mongoose.Schema.Types.ObjectId), мы его будем ссылаться на опред модель(User) и по id вытаскивать пользака.
			//Это связь между User и Post.Нужно установить связь между постами и пользаками,чтобы по этому id подгружать инфу по пользаку и её передавать на клиент...в поле authorPost.Для установления связи необходимо при получении всех статей в функ-ии обработчике getAll указать populate(authorPost) и запустить этот метод .exec()
			ref: 'User',
			required: true,
		},
		//optional
		tags: {
			type: Array,
			//так как теги это опциональная инфа(может и не передаваться)...то в этом случае пусть будет приходить как пустой массив
			default: [],
		},
		//optional
		imageUrl: String,
	},
	{
		//при создании любого пользователя схема будет прикручивать дату создания и обновления этой сущности
		timestamps: true,
	}
)
//экспортируем эту схему как Post
export default mongoose.model('Post', PostSchema)
