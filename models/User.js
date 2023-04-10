import mongoose from 'mongoose'
//создаём схему
//все свойства которые передаём как обязательные они прописываются как объект
//если не обязательные то как просто тип...например avatarUrl:String
const UserSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		passwordHash: {
			type: String,
			required: true,
		},
		avatarUrl: String,
	},
	{
		//при создании любого пользователя схема будет прикручивать дату создания и обновления этой сущности
		timestamps: true,
	}
)
//экспортируем эту схему как User
export default mongoose.model('User', UserSchema)
