/*  ******************************
  Semantic Module: Checkbox
  Author: Jack Lukic
  Notes: First Commit MAy 25, 2013

  Simple plug-in which maintains the state for ui dropdown

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.dropdown = function(parameters) {
  var
    $allModules     = $(this),
    $document       = $(document),
    
    settings        = $.extend(true, {}, $.fn.dropdown.settings, parameters),

    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,

    selector        = $allModules.selector || '',
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    invokedResponse
  ;

  $allModules
    .each(function() {
      var
        $module       = $(this),
        $menu         = $(this).find(settings.selector.menu),
        $item         = $(this).find(settings.selector.item),
        $text         = $(this).find(settings.selector.text),
        $input        = $(this).find(settings.selector.input),
        
        isTouchDevice = ('ontouchstart' in document.documentElement),
        
        selector      = $module.selector || '',
        element       = this,
        instance      = $module.data('module-' + settings.namespace),
        
        className     = settings.className,
        metadata      = settings.metadata,
        namespace     = settings.namespace,
        animation     = settings.animation,
        
        errors        = settings.errors,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing dropdown with bound events', $module);
          console.log(settings.on);
          if(isTouchDevice) {
            $module
              .on('touchstart' + eventNamespace, module.toggle)
            ;
          }
          else if(settings.on == 'click') {
            $module
              .on('click' + eventNamespace, module.toggle)
            ;
          }
          else if(settings.on == 'hover') {
            $module
              .on('mouseenter' + eventNamespace, module.show)
              .on('mouseleave' + eventNamespace, module.delayedHide)
            ;
          }

          $item
            .on('click' + eventNamespace, module.event.item.click)
          ;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          $module
            .off(namespace)
          ;
        },

        event: {

          item: {

            click: function () {
              var
                value = $(this).data(metadata.value) || $(this).text()
              ;
              if( $.isFunction( module.action[settings.action] ) ) {
                module.verbose('Triggering preset item action', settings.action);
                module.action[ settings.action ](value);
              }
              else if( $.isFunction(settings.action) ) {
                module.verbose('Triggering user action', settings.action);
                settings.action(value);
              }
              else {
                module.error(errors.action);
              }
              $.proxy(settings.onChange, $menu.get())(value);
            }

          }

        },

        intent: {

          test: function(event, callback) {
            module.debug('Determining whether event occurred in dropdown', event.target);
            if( $(event.target).closest($menu).size() == 0 ) {
              callback();
              event.stopPropagation();
            }
          },

          bind: function() {
            module.verbose('Binding hide intent event to document');
            $(document)
              .on('click', function(event) {
                 module.intent.test(event, module.hide);
              })
            ;
          },

          unbind: function() {
            module.verbose('Removing hide intent event from document');
            $document
              .off('click')
            ;
          }

        },

        action: {

          nothing: function() {},

          hide: function() {
            module.hide();
          },

          changeText: function(value) {
            module.debug('Changing text', value);
            $text.text(value);
            module.hide();
          },

          form: function(value) {
            module.debug('Adding selected value to hidden input', value);
            $text.text(value);
            $input.val(value);
            module.hide();
          }

        },

        is: {
          visible: function() {
            return $menu.is(':visible');
          },
          hidden: function() {
            return $menu.is(':not(:visible)');
          }
        },

        can: {
          click: function() {
            return (isTouchDevice || settings.on == 'click');
          },
          show: function() {
            return !$module.hasClass(className.disabled);
          }
        },

        animate: {
          show: function() {
            module.verbose('Doing menu showing animation');
            if(animation.show == 'show') {
              $menu
                .show()
              ;
            }
            else if(animation.show == 'slide') {
              $menu
                .clearQueue()
                .children()
                  .clearQueue()
                  .css('opacity', 0)
                  .delay(100)
                  .animate({
                    opacity : 1
                  }, 300, 'easeOutQuad')
                  .end()
                .slideDown(200, 'easeOutQuad')
              ;
            }
          },
          hide: function() {
            module.verbose('Doing menu hiding animation');
            if(animation.hide == 'hide') {
              $menu
                .hide()
              ;
            }
            else if(animation.hide == 'slide') {
              $menu
                .clearQueue()
                .children()
                  .clearQueue()
                  .css('opacity', 1)
                  .animate({
                    opacity : 0
                  }, 300, 'easeOutQuad')
                  .end()
                .delay(100)
                .slideUp(200, 'easeOutQuad')
              ;
            }
          }
        },

        show: function() {
          clearTimeout(module.graceTimer);
          if( !module.is.visible() ) {
            module.debug('Showing dropdown');
            $module
              .addClass(className.active)
            ;
            module.animate.show();
            if( module.can.click() ) {
              module.intent.bind();
            }
            $.proxy(settings.onShow, $menu.get())();
          }
        },

        delayedHide: function() {
          module.verbose('User moused away setting timer to hide dropdown');
          module.graceTimer = setTimeout(module.hide, settings.gracePeriod);
        },

        hide: function() {
          if( !module.is.hidden() ) {
            module.debug('Hiding dropdown');
            $module
              .removeClass(className.active)
            ;
            if( module.can.click() ) {
              module.intent.unbind();
            }
            module.animate.hide();
            $.proxy(settings.onHide, $menu.get())();
          }
        },

        toggle: function() {
          module.verbose('Toggling menu visibility');
          if(module.can.show()) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        setting: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, settings, name);
            }
            else {
              settings[name] = value;
            }
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            module.performance.log(arguments[0]);
            module.debug = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            module.performance.log(arguments[0]);
            module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },
        error: function() {
          if(console.log !== undefined) {
            module.error = Function.prototype.bind.call(console.log, console, settings.moduleName + ':');
          }
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime,
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({ 
                'Element'        : element,
                'Name'           : message, 
                'Execution Time' : executionTime
              });
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 100);
            }
          },
          display: function() {
            var
              title              = settings.moduleName,
              caption            = settings.moduleName + ': ' + selector + '(' + $allModules.size() + ' elements)',
              totalExecutionTime = 0
            ;
            if(selector) {
              title += 'Performance (' + selector + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                });
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                });
              }
              console.log('Total Execution Time:', totalExecutionTime +'ms');
              console.groupEnd();
              performance = [];
              time        = false;
            }
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            maxDepth,
            found
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split('.');
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
                return true;
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return true;
              }
              module.error(errors.method);
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            module.verbose('Executing invoked function', found);
            return found.apply(context, passedArguments);
          }
          return found || false;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        invokedResponse = module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.dropdown.settings = {

  moduleName  : 'Dropdown Module',
  namespace   : 'dropdown',
  
  verbose     : true,
  debug       : true,
  performance : false,
  
  action      : 'hide',
  
  animation   : {
    show: 'slide',
    hide: 'slide'
  },
  
  on          : 'click',
  
  gracePeriod : 300,
  
  onChange : function(){},
  onShow   : function(){},
  onHide   : function(){},
  
  errors   : {
    action   : 'You called a dropdown action that was not defined',
    method   : 'The method you called is not defined.'
  },

  metadata: {
    value: 'value'
  },

  selector : {
    menu  : '.menu',
    item  : '.menu > .item',
    text  : '> .text',
    input : '> input[type="hidden"]',
  },

  className : {
    active : 'visible'
  }

};

})( jQuery, window , document );