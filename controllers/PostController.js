import PostModel from '../models/Post.js'

//создание статьи
export const createPost = async (req, res) => {
	//используем try{}catch(err) т.к. будем отлавливать ошибки
	try {
		//пишем функционал на создание статьи
		const doc = new PostModel({
			title: req.body.title,
			text: req.body.text,
			imageUrl: req.body.imageUrlPost,
			tags: req.body.tags.split(','),
			//req.userId берём из авторизации расшифрованный token(req.userId = decoded._id)...и оттуда его вытаскиваем сюда и передаём в authorPost и таким образом получем user(по id)
			authorPost: req.userId,
		})

		//когда документ был подготовлен его нужно содать с помощью save()
		const post = await doc.save()

		//и после создания возвращает в ответе на клиент
		res.json(post)
	} catch (err) {
		console.log(err)
		return res.status(500).json({
			message: 'Статья не создана',
		})
	}
}

//получение всех статей
export const getAll = async (req, res) => {
	try {
		//получаем все статьи.Этот метод возвращает массив(статей)
		const posts = await PostModel.find().populate('authorPost').exec()
		res.json(posts)
	} catch (err) {
		return res.status(500).json({
			message: 'Не удалось получить все статьи',
		})
	}
}

//получение одной статьи
export const getOne = async (req, res) => {
	try {
		//получаем id(название 'id' может быть любым, здесь оно такое потому что мы прописали в запросе как параметр :id (app.get('/posts/:id', PostController.getOne)))статьи из url
		const postId = req.params.id

		//используем этот метод findOneAndUpdate т.к. нам нужно не только найти статью, но и в итоге считать её просмотры viewCountPost и с помощью этого метода мы увеличим кол-во просмотров.
		PostModel.findOneAndUpdate(
			//ещем по id из params
			{ _id: postId },
			//специальный метод в MongoDB increment...увеличиваем счётчик
			{ $inc: { viewCountPost: 1 } },
			//хотим получить статью,обновить данные и потом обновлённый результат вернуть
			{ returnDocument: 'after' }
		)
			.populate('authorPost')

			//обрабатываем Promise после обновления статьи
			.then(doc => {
				//если статья удалилась например
				if (!doc) {
					console.log(doc)
					return res.status(404).json({
						message: 'Нет такой статьи undefined',
					})
				}

				res.json(doc)
			})

			.catch(err => {
				console.log(err)
				return res.status(500).json({
					message: 'Не удалось получить статью then catch',
				})
			})
	} catch (err) {
		console.log(err)
		return res.status(500).json({
			message: 'Нет такой статьи catch',
		})
	}
}

//удаление статьи статьи
export const removePost = async (req, res) => {
	try {
		//получаем id(название 'id' может быть любым, здесь оно такое потому что мы прописали в запросе как параметр :id (app.get('/posts/:id', PostController.getOne)))статьи из url
		const postId = req.params.id

		PostModel.findByIdAndDelete({ _id: postId })
			//обрабатываем Promise после вызова функции findByIdAndDelete
			.then(doc => {
				//если статья удалилась например...она undefined
				if (!doc) {
					console.log(doc)
					return res.status(404).json({
						message: 'Нет такой статьи undefined',
					})
				}
				res.json(doc._id)
			})
			.catch(err => {
				console.log(err)
				return res.status(500).json({
					message: 'Не удалось получить статью then catch',
				})
			})
	} catch (err) {
		console.log(err)
		return res.status(500).json({
			message: 'Нет такой статьи catch',
		})
	}
}

//обновление статьи
export const updatePost = async (req, res) => {
	try {
		//получаем id(название 'id' может быть любым, здесь оно такое потому что мы прописали в запросе как параметр :id (app.get('/posts/:id', PostController.getOne)))статьи из url
		const postId = req.params.id

		//используем этот метод findOneAndUpdate т.к. нам нужно не только найти статью, но и в итоге считать её просмотры viewCountPost и с помощью этого метода мы увеличим кол-во просмотров.
		PostModel.findOneAndUpdate(
			//ещем по id из params
			{ _id: postId },
			//для изменения статьи мы передаём объект со всеми полями что и при создании статьи, но с изменёнными как мы хотим данными.
			{
				title: req.body.title,
				text: req.body.text,
				imageUrl: req.body.imageUrlPost,
				tags: req.body.tags.split(','),
				authorPost: req.userId,
			},
			//хотим получить обновлённую статью,обновить данные и потом обновлённый результат вернуть
			{ returnDocument: 'after' }
		)
			//обрабатываем Promise после обновления статьи
			.then(doc => {
				//если статья удалилась например undefined
				if (!doc) {
					return res.status(404).json({
						message: 'Нет статьи для обновления (undefined)',
					})
				}
				//если всё ок и статья нашлась...возвращаем уже обновлённую статью
				res.json(doc)
			})
			.catch(err => {
				console.log(err)
				return res.status(500).json({
					message: 'Не удалось обновить статью then catch',
				})
			})
	} catch (err) {
		console.log(err)
		return res.status(500).json({
			message: 'Не удалось обновить статью catch',
		})
	}
}

export const getLastTags = async (req, res) => {
	try {
		//получаем 5 статей.Этот метод возвращает массив(статей)
		const posts = await PostModel.find().limit(5).exec()
		//получаем теги
		const tags = posts
			.map(post => post.tags)
			.flat()
			.slice(0, 5)

		res.json(tags)
	} catch (err) {
		return res.status(500).json({
			message: 'Не удалось получить все теги',
		})
	}
}
