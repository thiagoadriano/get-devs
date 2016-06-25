"use strict";

var app = angular.module("appProfite", ['ngRoute']);

(function (app) {
  app.run(["$rootScope", function ($rootScope) {
    $rootScope.listaCompra = [];
  }]).constant("OrdenarOpt", [{ id: 1, label: "Mais Recentes" }, { id: 2, label: "Menor Preço" }, { id: 3, label: "Maior Preço" }]);
})(app);

(function (app) {

  var configRoute = function configRoute($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/home.html',
      controller: 'homeController'
    }).when('/carrinho', {
      templateUrl: 'views/carrinho-compras.html',
      controller: 'carrinhoController'
    }).otherwise('/');
  };

  app.config(["$routeProvider", configRoute]);
})(app);
"use strict";

(function (app) {
  var CarrinhoCTRL = function CarrinhoCTRL($scope, $rootScope) {
    $scope.ListaCompras = $rootScope.listaCompra;
  };

  app.controller('carrinhoController', ["$scope", "$rootScope", CarrinhoCTRL]);
})(app);

(function (app) {
  var HomeCTRL = function HomeCTRL($scope, OrdenarOpt, $rootScope, Model, $timeout, Util) {
    var itensCollapseCor = 5;
    $scope.ordernarList = OrdenarOpt;
    $scope.ordenarTipo = null;
    $scope.Cores = [];
    $scope.Precos = [];
    $scope.Tamanhos = [];
    $scope.Produtos = [];
    $scope.produtosCopia = [];
    $scope.corSelecionada = { id: 0 };
    $scope.precoSelecionado = { id: 0 };
    $scope.tamanhoSelecionado = { id: 0 };
    $scope.pagina = 1;
    $scope.txtExpandCores = "Ver todas as cores";
    $scope.coresOpen = false;
    $scope.mensagemErro = null;

    Model.Cores.get().then(function (res) {
      $scope.Cores = res;Util.collapse(itensCollapseCor);
    }, function (err) {
      console.log(err);
    });
    Model.Preco.get().then(function (res) {
      $scope.Precos = res;
    }, function (err) {
      console.error(err);
    });
    Model.Tamanhos.get().then(function (res) {
      $scope.Tamanhos = res;
    }, function (err) {
      console.error(err);
    });

    $scope.selecionaCor = function (cor) {
      $scope.corSelecionada = cor;Util.filtro(Util, $scope);
    };
    $scope.selecionaPreco = function (preco) {
      $scope.precoSelecionado = preco;Util.filtro(Util, $scope);
    };
    $scope.selecionaTamanho = function (tamanho) {
      $scope.tamanhoSelecionado = tamanho;Util.filtro(Util, $scope);
    };
    $scope.replaceValor = function (valor) {
      return valor.toFixed(2).replace(".", ",");
    };
    $scope.addCarrinho = function (item) {
      item.produto.addCart = true;
      $rootScope.listaCompra.push(item);
    };

    $scope.troggleColapse = function () {
      Util.troggleColapse($scope, Util);
    };

    $scope.carregarMaisProdutos = function () {
      Util.getProdutos($scope.pagina, $scope, Util, Model, $timeout);
    };

    $scope.ordenarChange = function () {
      Util.filtro(Util, $scope);
    };

    $scope.carregarMaisProdutos();
  };

  app.controller('homeController', ["$scope", "OrdenarOpt", "$rootScope", "Model", "$timeout", "Util", HomeCTRL]);
})(app);
'use strict';

(function (app) {

  var CoresService = function CoresService($q, $http) {
    var def = $q.defer();
    var listaCores = [];
    var getService = function getService() {
      if (listaCores.length) {
        def.resolve(listaCores);
      } else {
        $http.get("data_db/cores.json").success(function (res) {
          listaCores = res;
          def.resolve(res);
        }).error(function (err) {
          def.reject(err);
        });
      }
    };

    var get = function get() {
      return def.promise;
    };

    var find = function find(busca) {
      listaCores.map(function (item) {
        return item.id === busca.id;
      });
    };

    getService();

    return {
      get: get,
      find: find
    };
  };

  app.factory("Cores", ["$q", "$http", CoresService]);
})(app);

(function (app) {
  var ServicosModels = function ServicosModels(Cores, Tamanhos, Preco, Produtos) {
    return {
      Cores: Cores,
      Tamanhos: Tamanhos,
      Preco: Preco,
      Produtos: Produtos
    };
  };

  app.factory("Model", ["Cores", "Tamanhos", "Preco", "Produtos", ServicosModels]);
})(app);

'use strict';
(function (app) {

  var PrecoService = function PrecoService($q, $http) {
    var def = $q.defer();
    var listaPreco = [];
    var getService = function getService() {
      if (listaPreco.length) {
        def.resolve(listaPreco);
      } else {
        $http.get("data_db/faixa_preco.json").success(function (res) {
          listaPreco = res;
          def.resolve(res);
        }).error(function (err) {
          def.reject(err);
        });
      }
    };

    var get = function get() {
      return def.promise;
    };

    var find = function find(busca) {
      listaPreco.map(function (item) {
        return item.id === busca.id;
      });
    };

    getService();

    return {
      get: get,
      find: find
    };
  };

  app.factory("Preco", ["$q", "$http", PrecoService]);
})(app);

(function (app) {
  var ProdutosModel = function ProdutosModel($http) {

    var get = function get(skip, success, error) {
      $http.get("data_db/produtos_" + skip + ".json").success(function (res) {
        success(res);
      }).error(function (err) {
        error(err);
      });
    };

    return {
      get: get
    };
  };
  app.factory("Produtos", ["$http", ProdutosModel]);
})(app);

'use strict';
(function (app) {

  var TamanhosService = function TamanhosService($q, $http) {
    var def = $q.defer();
    var listaTamanhos = [];
    var getService = function getService() {
      if (listaTamanhos.length) {
        def.resolve(listaTamanhos);
      } else {
        $http.get("data_db/tamanhos.json").success(function (res) {
          listaTamanhos = res;
          def.resolve(res);
        }).error(function (err) {
          def.reject(err);
        });
      }
    };

    var get = function get() {
      return def.promise;
    };

    var find = function find(busca) {
      listaTamanhos.map(function (item) {
        return item.id === busca.id;
      });
    };

    getService();

    return {
      get: get,
      find: find
    };
  };

  app.factory("Tamanhos", ["$q", "$http", TamanhosService]);
})(app);

(function (app) {
  var UtilService = function UtilService() {
    return {

      msgErro: function msgErro(msg, scope, time) {
        scope.mensagemErro = msg;
        time(function () {
          scope.mensagemErro = null;
        }, 4000);
      },

      trataClasseBtn: function trataClasseBtn(ocasiao) {
        var bt = document.querySelector("#btnCores");
        var seta = bt.querySelector('.arrow');
        var classeSeta = seta.className;
        if (!ocasiao) {
          classeSeta = classeSeta.split(" ");
          classeSeta.splice(1, classeSeta.indexOf('open'));
          seta.className = classeSeta.join(" ");
        } else {
          seta.className += " open";
        }
      },

      collapse: function collapse(itensCollapseCor) {
        var boxcores = document.querySelector("#lista-cores");
        angular.element(boxcores).ready(function () {
          var listaCores = boxcores.querySelectorAll("li");
          if (listaCores.length) {
            for (var i = 0; i < listaCores.length; i++) {
              if (i > itensCollapseCor && listaCores[i].className.indexOf("colapse") < 0) {
                angular.element(listaCores[i]).addClass('colapse hide');
              }
            }
          }
        });
      },

      troggleColapse: function troggleColapse(scope, Util) {
        var lista = document.querySelectorAll(".colapse");
        for (var i = 0; i < lista.length; i++) {
          if (lista[i].className.indexOf("hide") < 0) {
            angular.element(lista[i]).addClass('hide');
            scope.txtExpandCores = "Ver todas as cores";
          } else if (lista[i].className.indexOf("hide") > 0) {
            var el = angular.element(lista[i]);
            el.removeClass('hide');
            scope.txtExpandCores = "Ocultar as cores";
          }
        }
        scope.coresOpen = !scope.coresOpen;
        Util.trataClasseBtn(scope.coresOpen);
      },

      getProdutos: function getProdutos(skip, scope, Util, Model, time) {
        Model.Produtos.get(skip, function (res) {
          for (var i in res) {
            res[i].produto.addCart = false;
            scope.Produtos.push(res[i]);
            scope.produtosCopia.push(res[i]);
          }
          scope.pagina++;
          Util.filtro(Util, scope);
        }, function (err) {
          Util.msgErro("Não há mais produtos.", scope, time);
          console.error(err);
        });
      },

      filtroCor: function filtroCor(scope) {
        if (scope.corSelecionada.id > 0) {
          var temp = scope.precoSelecionado.id > 0 || scope.tamanhoSelecionado.id > 0 ? angular.copy(scope.Produtos) : angular.copy(scope.produtosCopia);
          scope.Produtos = [];
          for (var i in temp) {
            for (var j in temp[i].caracteristicas.cores) {
              if (temp[i].caracteristicas.cores[j] === scope.corSelecionada.id) {
                scope.Produtos.push(temp[i]);
                break;
              }
            }
          }
        }
      },

      filtroTamanho: function filtroTamanho(scope) {
        if (scope.tamanhoSelecionado.id > 0) {
          var temp = scope.precoSelecionado.id > 0 || scope.corSelecionada.id > 0 ? angular.copy(scope.Produtos) : angular.copy(scope.produtosCopia);
          scope.Produtos = [];
          for (var i in temp) {
            for (var j in temp[i].caracteristicas.tamanho) {
              if (temp[i].caracteristicas.tamanho[j] === scope.tamanhoSelecionado.id) {
                scope.Produtos.push(temp[i]);
                break;
              }
            }
          }
        }
      },

      filtroPreco: function filtroPreco(scope) {
        if (scope.precoSelecionado.id > 0) {
          var temp = scope.tamanhoSelecionado.id > 0 || scope.corSelecionada.id > 0 ? angular.copy(scope.Produtos) : angular.copy(scope.produtosCopia);
          scope.Produtos = [];
          for (var i in temp) {
            if (scope.precoSelecionado.to !== null) {

              if (temp[i].pagamento.por >= scope.precoSelecionado.from && temp[i].pagamento.por <= scope.precoSelecionado.to) {
                scope.Produtos.push(temp[i]);
              }
            } else if (scope.precoSelecionado.to === null) {

              if (temp[i].pagamento.por >= scope.precoSelecionado.from) {
                scope.Produtos.push(temp[i]);
              }
            }
          }
        }
      },

      semFiltro: function semFiltro(scope) {
        if (scope.precoSelecionado.id < 1 && scope.tamanhoSelecionado.id < 1 && scope.corSelecionada.id < 1) {
          scope.Produtos = angular.copy(scope.produtosCopia);
        }
      },

      ordenar: function ordenar(scope, Util) {
        if (scope.ordenarTipo > 0) {
          switch (scope.ordenarTipo) {
            case 1:
              scope.Produtos.sort(function (a, b) {
                return new Date(a.produto.data) < new Date(b.produto.data);
              });
              scope.$apply();
              break;
            case 2:
              scope.Produtos.sort(function (a, b) {
                return a.pagamento.por > b.pagamento.por;
              });
              scope.$apply();
              break;
            case 3:
              scope.Produtos.sort(function (a, b) {
                return a.pagamento.por < b.pagamento.por;
              });
              scope.$apply();
              break;
            default:
              break;
          }
        }
      },

      filtro: function filtro(Util, $scope) {
        Util.filtroCor($scope);
        Util.filtroTamanho($scope);
        Util.filtroPreco($scope);
        Util.ordenar($scope);
        Util.semFiltro($scope);
      }

    };
  };

  app.factory("Util", UtilService);
})(app);