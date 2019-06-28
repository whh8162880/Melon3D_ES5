module rf{
    /**地图寻路*/ 
	export class NavigationCityAction extends ActorAction{
		constructor(){
			super()
			this.stateID = StateDefine.NAVIGATION_CITY
		}
	}
}