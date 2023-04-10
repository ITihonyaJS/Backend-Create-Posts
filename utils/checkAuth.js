import jwt from 'jsonwebtoken'

//создаём middleware, кот.будет решать можно ли возвращать какую то секретную инфу или нет
export default (req, res, next) => {
	//необходимо спарсить token(т.е.вытащить его из запроса)
	const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')
	if (token) {
		try {
			//расшифровываем token
			const decoded = jwt.verify(token, 'secret123')

			//если token расшифровался, то вшиваем в req.userId данные от расшифровки
			req.userId = decoded._id

			//после того как сохранил данные от расшифровки переходим с помощью next() к след.действиям
			next()
		} catch (err) {
			//если не смог расшифровать token, то кидаем ошибку
			return res.status(403).json({ mesage: 'Нет доступа T' })
		}
	} else {
		//если token нет(нет прав у пользака) или он закончился(невалидный)кидаем ошибку
		return res.status(403).json({ mesage: 'Нет доступа TFull' })
	}
}
